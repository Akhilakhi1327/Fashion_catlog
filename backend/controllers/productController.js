const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

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

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    category, minPrice, maxPrice, color, size,
    material, occasion, search, sort, featured,
    page = 1, limit = 12,
  } = req.query;

  const query = {};

  if (category) query.category = category;
  if (occasion) query.occasion = occasion;
  if (material) query.material = { $regex: material, $options: 'i' };
  if (color) query.colors = { $in: [new RegExp(color, 'i')] };
  if (size) query.sizes = { $in: [size] };
  if (featured === 'true') query.featured = true;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (search) {
    const searchTokens = search.trim().split(/\s+/).filter(Boolean);
    if (searchTokens.length > 0) {
      // Fuzzy match: all tokens must be present, but can be anywhere and in any order
      const regexStr = searchTokens.map(token => `(?=.*${token})`).join('');
      const regex = new RegExp(regexStr, 'i');
      query.$or = [
        { name: { $regex: regex } },
        { category: { $regex: regex } },
        { material: { $regex: regex } },
        { description: { $regex: regex } },
      ];
    }
  }

  // Sorting
  let sortOption = { createdAt: -1 }; // default: newest
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, totalProducts] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      products,
      totalProducts,
      currentPage: pageNum,
      totalPages: Math.ceil(totalProducts / limitNum),
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.status(200).json({ success: true, data: product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  let { name, category, price, description, stock, material, occasion, featured } = req.body;
  logger.info(`Creating new product: ${name} in category: ${category}`);

  // Parse colors, sizes, and variants (may come as JSON strings)
  let colors = [];
  let sizes = [];
  let variants = [];
  try {
    colors = req.body.colors
      ? (typeof req.body.colors === 'string' ? JSON.parse(req.body.colors) : req.body.colors)
      : [];
  } catch { colors = req.body.colors ? req.body.colors.split(',').map(c => c.trim()) : []; }

  try {
    sizes = req.body.sizes
      ? (typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes)
      : [];
  } catch { sizes = req.body.sizes ? req.body.sizes.split(',').map(s => s.trim()) : []; }

  try {
    variants = req.body.variants
      ? (typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants)
      : [];
  } catch { variants = []; }

  // Upload images to Cloudinary
  let images = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file =>
      uploadToCloudinary(file.buffer, 'elite-fashion/products')
    );
    images = await Promise.all(uploadPromises);
  }

  const product = await Product.create({
    name, category, price: Number(price), description,
    stock: Number(stock) || 0, colors, sizes, variants, material,
    occasion, images, featured: featured === 'true',
  });

  await logAdminAction(req, 'PRODUCT_CREATE', `Created product: ${product.name} (ID: ${product._id}) with initial stock: ${product.stock}`);

  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Handle image removals
  if (req.body.removeImages) {
    let removePublicIds = [];
    try {
      removePublicIds = JSON.parse(req.body.removeImages);
    } catch { removePublicIds = []; }

    if (removePublicIds.length > 0) {
      await Promise.all(removePublicIds.map(pid => deleteFromCloudinary(pid)));
      product.images = product.images.filter(img => !removePublicIds.includes(img.publicId));
    }
  }

  // Upload new images
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file =>
      uploadToCloudinary(file.buffer, 'elite-fashion/products')
    );
    const newImages = await Promise.all(uploadPromises);
    product.images = [...product.images, ...newImages];
  }

  // Parse colors, sizes, and variants
  let colors = product.colors;
  let sizes = product.sizes;
  let variants = product.variants;
  if (req.body.colors !== undefined) {
    try { colors = typeof req.body.colors === 'string' ? JSON.parse(req.body.colors) : req.body.colors; }
    catch { colors = req.body.colors.split(',').map(c => c.trim()); }
  }
  if (req.body.sizes !== undefined) {
    try { sizes = typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes; }
    catch { sizes = req.body.sizes.split(',').map(s => s.trim()); }
  }
  if (req.body.variants !== undefined) {
    try { variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants; }
    catch { variants = product.variants; }
  }

  // Update fields
  product.name = req.body.name || product.name;
  product.category = req.body.category || product.category;
  product.price = req.body.price !== undefined ? Number(req.body.price) : product.price;
  product.description = req.body.description || product.description;
  product.stock = req.body.stock !== undefined ? Number(req.body.stock) : product.stock;
  product.material = req.body.material !== undefined ? req.body.material : product.material;
  product.occasion = req.body.occasion || product.occasion;
  product.featured = req.body.featured !== undefined ? req.body.featured === 'true' : product.featured;
  product.colors = colors;
  product.sizes = sizes;
  product.variants = variants;

  const updatedProduct = await product.save();
  await logAdminAction(req, 'PRODUCT_UPDATE', `Updated product: ${product.name} (ID: ${product._id})`);
  res.status(200).json({ success: true, data: updatedProduct });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  logger.info(`Deleting product ID: ${req.params.id}`);
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Delete all images from Cloudinary
  if (product.images && product.images.length > 0) {
    await Promise.all(product.images.map(img => deleteFromCloudinary(img.publicId)));
  }

  await logAdminAction(req, 'PRODUCT_DELETE', `Deleted product: ${product.name} (ID: ${product._id})`);

  await product.deleteOne();
  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
const updateStock = asyncHandler(async (req, res) => {
  logger.info(`Updating stock for product ID: ${req.params.id}`);
  const { stock } = req.body;
  if (stock === undefined || stock < 0) {
    res.status(400);
    throw new Error('Please provide a valid stock value');
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock: Number(stock) },
    { new: true, runValidators: true }
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await logAdminAction(req, 'STOCK_UPDATE', `Updated overall stock for product: ${product.name} (ID: ${product._id}) to: ${stock}`);

  res.status(200).json({ success: true, data: product });
});

// @desc    Update variant stock (SKU-level)
// @route   PATCH /api/products/:id/variants/:variantId/stock
// @access  Private/Admin
const updateVariantStock = asyncHandler(async (req, res) => {
  logger.info(`Updating variant stock for product ID: ${req.params.id}`);
  const { stock } = req.body;
  if (stock === undefined || Number(stock) < 0) {
    res.status(400);
    throw new Error('Please provide a valid stock value');
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const variant = product.variants.find(
    (v) => v._id.toString() === req.params.variantId.toString()
  );
  if (!variant) {
    res.status(404);
    throw new Error('Variant not found');
  }

  variant.stock = Number(stock);
  // Recalculate overall stock
  product.stock = product.variants.reduce((acc, v) => acc + v.stock, 0);

  await product.save();

  await logAdminAction(req, 'STOCK_VARIANT_UPDATE', `Updated stock for variant ID: ${req.params.variantId} on product: ${product.name} (ID: ${product._id}) to: ${stock}`);

  res.status(200).json({ success: true, data: product });
});

// @desc    Add/Update variants on a product
// @route   PUT /api/products/:id/variants
// @access  Private/Admin
const updateProductVariants = asyncHandler(async (req, res) => {
  const { variants } = req.body; // array of {color, size, sku, stock}

  if (!variants || !Array.isArray(variants)) {
    res.status(400);
    throw new Error('Please provide variants array');
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.variants = variants;
  // Recalculate overall stock
  product.stock = variants.reduce((acc, v) => acc + v.stock, 0);

  await product.save();

  await logAdminAction(req, 'VARIANT_CONFIG_UPDATE', `Updated variants configuration on product: ${product.name} (ID: ${product._id})`);

  res.status(200).json({ success: true, data: product });
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  logger.info(`Review submission for product ID: ${req.params.id} by user: ${req.user._id}`);
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    // Check for Verified Purchase
    const Order = require('../models/Order'); // Local import since it's only needed here
    const hasBought = await Order.findOne({
      user: req.user._id,
      status: 'Delivered',
      'orderItems.product': product._id
    });

    if (!hasBought) {
      res.status(400);
      throw new Error('You can only review products you have purchased and received.');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private/Admin
const deleteProductReview = asyncHandler(async (req, res) => {
  logger.info(`Admin deleting review ${req.params.reviewId} from product ${req.params.id}`);
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const reviewId = req.params.reviewId;
  const reviewIndex = product.reviews.findIndex(r => r._id.toString() === reviewId);

  if (reviewIndex === -1) {
    res.status(404);
    throw new Error('Review not found');
  }

  product.reviews.splice(reviewIndex, 1);
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.length > 0
    ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
    : 0;

  await product.save();
  await logAdminAction(req, 'REVIEW_DELETE', `Deleted review ID: ${reviewId} on product: ${product.name} (ID: ${product._id})`);
  res.status(200).json({ success: true, message: 'Review deleted successfully', data: product });
});

module.exports = { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  updateStock, 
  updateVariantStock, 
  updateProductVariants, 
  createProductReview,
  deleteProductReview 
};
