const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalProducts,
    totalOrders,
    categories,
    outOfStock,
    lowStock,
    recentOrders,
    ordersByStatus,
    featuredProducts,
  ] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    Product.distinct('category'),
    Product.countDocuments({ stock: 0 }),
    Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Product.find({ featured: true }).limit(6),
  ]);

  // Format ordersByStatus as an object
  const statusBreakdown = {};
  ordersByStatus.forEach(({ _id, count }) => {
    statusBreakdown[_id] = count;
  });

  res.status(200).json({
    success: true,
    data: {
      totalProducts,
      totalOrders,
      totalCategories: categories.length,
      categories,
      outOfStock,
      lowStock,
      recentOrders,
      ordersByStatus: statusBreakdown,
    },
  });
});

module.exports = { getDashboardStats };
