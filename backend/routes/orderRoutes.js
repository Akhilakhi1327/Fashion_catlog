const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getMyOrders,
  exportOrders,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const { createOrderValidation } = require('../middleware/validationMiddleware');

// Protected routes
router.route('/').post(protect, createOrderValidation, createOrder).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/export').get(protect, admin, exportOrders);
router.route('/:id').put(protect, admin, updateOrderStatus).delete(protect, admin, deleteOrder);

module.exports = router;
