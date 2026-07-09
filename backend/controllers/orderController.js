const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const sendEmail = require('../utils/sendEmail');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');
const sendWhatsApp = require('../utils/sendWhatsApp');

const logAdminAction = async (req, action, details) => {
  try {
    const adminUser = req.admin || (req.user && req.user.role === 'admin' ? req.user : null);
    if (adminUser) {
      await AuditLog.create({
        action,
        admin: adminUser._id,
        adminName: adminUser.name,
        details,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    }
  } catch (err) {
    console.error('AuditLog creation failed:', err.message);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { customerName, phone, address, orderItems } = req.body;

  logger.info(`Incoming order request from user: ${req.user._id} for customer: ${customerName}`);

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  if (!customerName || !phone || !address) {
    res.status(400);
    throw new Error('Please provide all required fields (customerName, phone, address)');
  }

  // Calculate prices and check/decrement stock atomically to prevent race conditions
  let totalPrice = 0;
  const decrementedItems = [];

  try {
    for (const item of orderItems) {
      // First fetch the product to get its name & ensure it exists
      const productObj = await Product.findById(item.product);
      if (!productObj) {
        throw new Error(`Product not found: ${item.name || item.product}`);
      }

      const hasVariants = productObj.variants && productObj.variants.length > 0 && item.color && item.size;
      let updatedProduct = null;

      if (hasVariants) {
        // Atomic decrement for both SKU-level variant stock and parent overall stock
        updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            variants: {
              $elemMatch: {
                color: item.color,
                size: item.size,
                stock: { $gte: Number(item.qty) }
              }
            }
          },
          {
            $inc: {
              "variants.$[elem].stock": -Number(item.qty),
              stock: -Number(item.qty)
            }
          },
          {
            arrayFilters: [{ "elem.color": item.color, "elem.size": item.size }],
            new: true
          }
        );
      } else {
        // Fallback atomic decrement of overall stock
        updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            stock: { $gte: Number(item.qty) }
          },
          {
            $inc: { stock: -Number(item.qty) }
          },
          { new: true }
        );
      }

      // If updatedProduct is null, it means the query matched 0 documents (due to insufficient stock)
      if (!updatedProduct) {
        throw new Error(`Insufficient stock for product: ${productObj.name}${hasVariants ? ` (${item.color}/${item.size})` : ''}`);
      }

      // Keep track of decremented stock for rollback if later items fail
      decrementedItems.push({
        product: item.product,
        qty: item.qty,
        color: item.color,
        size: item.size,
        hasVariants
      });

      // Populate details in item
      item.price = updatedProduct.price;
      item.image = updatedProduct.images && updatedProduct.images.length > 0 ? updatedProduct.images[0].url : '';
      totalPrice += updatedProduct.price * item.qty;
    }

    // Write order to DB
    const order = await Order.create({
      user: req.user._id,
      customerName,
      phone,
      address,
      orderItems,
      totalPrice,
    });

    // Clear user's shopping cart items after order placement
    try {
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        cart.items = [];
        await cart.save();
        logger.info(`Shopping cart cleared for user: ${req.user._id} after order placement.`);
      }
    } catch (cartErr) {
      logger.error(`Error clearing cart for user ${req.user._id}: ${cartErr.message}`);
    }

    // Send Email Notification to Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@elitefashion.com';
    
    let itemsList = orderItems.map(item => `- ${item.name} (Qty: ${item.qty}) x ₹${item.price}`).join('\n');

    const emailMessage = `
      New Order Received!
      
      Order Details:
      ID: ${order._id}
      Customer Name: ${customerName}
      Phone: ${phone}
      Address: ${address}
      
      Items:
      ${itemsList}
      
      Total Value: ₹${totalPrice}
      
      Log into your admin dashboard to process this order.
    `;

    await sendEmail({
      email: adminEmail,
      subject: `New Order Received - ${customerName}`,
      message: emailMessage,
    });

    // Send transactional order confirmation email to customer
    if (req.user && req.user.email) {
      const customerEmailMessage = `
        Dear ${customerName},

        Thank you for shopping with House Of Induva! We have received your order and our team is already working on processing it.

        Order Summary:
        - Order ID: ${order._id}
        - Total Price: ₹${totalPrice}

        Items Purchased:
        ${itemsList}

        Delivery Details:
        - Customer Name: ${customerName}
        - Contact Phone: ${phone}
        - Shipping Address: ${address}

        We will keep you updated on the shipment status. For any queries, feel free to reply to this email.

        Best regards,
        The House Of Induva Team
      `;

      try {
        await sendEmail({
          email: req.user.email,
          subject: `Order Confirmation - House Of Induva (Order #${order._id})`,
          message: customerEmailMessage,
        });
        logger.info(`Transactional order confirmation email sent to customer: ${req.user.email}`);
      } catch (mailErr) {
        logger.error(`Failed to send order confirmation email to customer: ${mailErr.message}`);
      }
    }

    // Optional WhatsApp notification to customer if configured
    try {
      await sendWhatsApp(phone, 'order_confirmation', 'en_US', [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName },
            { type: 'text', text: order._id.toString() },
            { type: 'text', text: `₹${totalPrice}` }
          ]
        }
      ]);
    } catch (wsErr) {
      logger.error(`WhatsApp notification failed: ${wsErr.message}`);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! We will contact you soon.',
      data: order,
    });

  } catch (error) {
    // Saga Rollback: Re-increment any stock that was decremented before the failure occurred
    for (const rolledBack of decrementedItems) {
      try {
        if (rolledBack.hasVariants) {
          await Product.updateOne(
            {
              _id: rolledBack.product,
              variants: {
                $elemMatch: {
                  color: rolledBack.color,
                  size: rolledBack.size
                }
              }
            },
            {
              $inc: {
                "variants.$[elem].stock": Number(rolledBack.qty),
                stock: Number(rolledBack.qty)
              }
            },
            {
              arrayFilters: [{ "elem.color": rolledBack.color, "elem.size": rolledBack.size }]
            }
          );
        } else {
          await Product.updateOne(
            { _id: rolledBack.product },
            { $inc: { stock: Number(rolledBack.qty) } }
          );
        }
      } catch (rollbackErr) {
        console.error(`CRITICAL: Failed to rollback stock for product ${rolledBack.product}:`, rollbackErr.message);
      }
    }

    res.status(400);
    throw new Error(error.message || 'Failed to place order. Please try again.');
  }
});

// @desc    Get all orders with pagination, filtering and search
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const status = req.query.status || 'All';

  logger.info(`Fetching orders list: page=${page}, limit=${limit}, search="${search}", status="${status}"`);

  // Build query filter
  const query = {};
  if (status !== 'All') {
    query.status = status;
  }
  if (search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { customerName: searchRegex },
      { phone: searchRegex },
      { 'orderItems.name': searchRegex }
    ];
  }

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'id name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Aggregate counts for all statuses to feed tab badges
  const allStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  const statusCounts = {};
  for (const st of allStatuses) {
    statusCounts[st] = await Order.countDocuments({ status: st });
  }
  statusCounts['All'] = await Order.countDocuments();

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    statusCounts
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // If cancelling, restore stock
  if (status === 'Cancelled' && order.status !== 'Cancelled') {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const hasVariants = product.variants && product.variants.length > 0;
        if (hasVariants && item.color && item.size) {
          const variant = product.variants.find(
            (v) => v.color === item.color && v.size === item.size
          );
          if (variant) {
            variant.stock += Number(item.qty);
            product.stock = product.variants.reduce((acc, v) => acc + v.stock, 0);
          }
        } else {
          product.stock += Number(item.qty);
        }
        await product.save();
      }
    }
  }
  // If un-cancelling, reduce stock again
  if (order.status === 'Cancelled' && status !== 'Cancelled') {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.name}`);
      }
      const hasVariants = product.variants && product.variants.length > 0;
      if (hasVariants && item.color && item.size) {
        const variant = product.variants.find(
          (v) => v.color === item.color && v.size === item.size
        );
        if (!variant) {
          res.status(400);
          throw new Error(`Variant ${item.color}/${item.size} not found for ${product.name}`);
        }
        if (variant.stock < Number(item.qty)) {
          res.status(400);
          throw new Error(`Insufficient stock for ${product.name} (${item.color}/${item.size}). Only ${variant.stock} available.`);
        }
      } else {
        if (product.stock < Number(item.qty)) {
          res.status(400);
          throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available.`);
        }
      }
    }
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const hasVariants = product.variants && product.variants.length > 0;
        if (hasVariants && item.color && item.size) {
          const variant = product.variants.find(
            (v) => v.color === item.color && v.size === item.size
          );
          if (variant) {
            variant.stock -= Number(item.qty);
            product.stock = product.variants.reduce((acc, v) => acc + v.stock, 0);
          }
        } else {
          product.stock -= Number(item.qty);
        }
        await product.save();
      }
    }
  }

  order.status = status;
  await order.save();

  // Send status update email to customer
  if (order.user && order.user.email) {
    const statusUpdateMessage = `
      Dear ${order.customerName},

      The status of your order (Order ID: ${order._id}) has been updated.

      New Status: ${status}

      Order Details:
      - Delivery Address: ${order.address}
      - Total Amount: ₹${order.totalPrice}

      We will notify you further as shipping progresses.

      Best regards,
      The House Of Induva Team
    `;

    try {
      await sendEmail({
        email: order.user.email,
        subject: `Order Status Update: ${status} - House Of Induva`,
        message: statusUpdateMessage,
      });
      logger.info(`Order status update email sent to customer: ${order.user.email}`);
    } catch (mailErr) {
      logger.error(`Failed to send order status update email: ${mailErr.message}`);
    }
  }

  // Optional WhatsApp notification on status update
  try {
    if (order.phone) {
      await sendWhatsApp(order.phone, 'order_status_update', 'en_US', [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.customerName },
            { type: 'text', text: order._id.toString() },
            { type: 'text', text: status }
          ]
        }
      ]);
    }
  } catch (wsErr) {
    logger.error(`WhatsApp status update notification failed: ${wsErr.message}`);
  }

  await logAdminAction(req, 'ORDER_STATUS_UPDATE', `Updated order ID: ${order._id} status to: ${status}`);

  res.status(200).json({ success: true, data: order });
});

// @desc    Delete order
const deleteOrder = asyncHandler(async (req, res) => {
  logger.info(`Admin request to delete order ID: ${req.params.id}`);
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Restore stock if the order wasn't already cancelled
  if (order.status !== 'Cancelled') {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const hasVariants = product.variants && product.variants.length > 0;
        if (hasVariants && item.color && item.size) {
          const variant = product.variants.find(
            (v) => v.color === item.color && v.size === item.size
          );
          if (variant) {
            variant.stock += Number(item.qty);
            product.stock = product.variants.reduce((acc, v) => acc + v.stock, 0);
          }
        } else {
          product.stock += Number(item.qty);
        }
        await product.save();
      }
    }
  }

  await logAdminAction(req, 'ORDER_DELETE', `Deleted order ID: ${order._id} for customer: ${order.customerName}`);

  await order.deleteOne();
  logger.info(`Order ${req.params.id} deleted successfully`);
  res.status(200).json({ success: true, message: 'Order deleted successfully' });
});

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  logger.info(`Fetching orders for user ID: ${req.user._id}`);
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: orders });
});

// @desc    Export orders to CSV
// @route   GET /api/orders/export
// @access  Private/Admin
const exportOrders = asyncHandler(async (req, res) => {
  logger.info('Admin request to export orders to CSV');
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });

  // Create CSV Header
  let csvData = 'Order ID,Date,Customer Name,Phone,Email,Address,Status,Total Price,Products (Qty)\n';

  // Format each order
  orders.forEach((order) => {
    const date = new Date(order.createdAt).toLocaleDateString('en-IN');
    const items = order.orderItems.map((item) => `${item.name} (${item.qty})`).join('; ');
    const email = order.user ? order.user.email : 'N/A';
    
    // Wrap fields in quotes to prevent issues with commas in address or items
    csvData += `"${order._id}","${date}","${order.customerName}","${order.phone}","${email}","${order.address}","${order.status}","${order.totalPrice}","${items}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders_export.csv');
  res.status(200).send(csvData);
});

module.exports = { createOrder, getOrders, updateOrderStatus, deleteOrder, getMyOrders, exportOrders };
