const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  updateVariantStock,
  updateProductVariants,
  createProductReview,
  deleteProductReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected user routes
router.post('/:id/reviews', protect, createProductReview);

// Protected Admin routes
router.post('/', protect, admin, upload.array('images', 10), createProduct);
router.put('/:id', protect, admin, upload.array('images', 10), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.patch('/:id/stock', protect, admin, updateStock);
router.put('/:id/variants', protect, admin, updateProductVariants);
router.patch('/:id/variants/:variantId/stock', protect, admin, updateVariantStock);
router.delete('/:id/reviews/:reviewId', protect, admin, deleteProductReview);

module.exports = router;
