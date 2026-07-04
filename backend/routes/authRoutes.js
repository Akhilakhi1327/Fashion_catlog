const express = require('express');
const router = express.Router();
const { 
  loginAdmin, 
  logoutAdmin, 
  getAdminProfile,
  refreshAdminToken,
  forgotPasswordAdmin,
  resetPasswordAdmin
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../middleware/validationMiddleware');

router.post('/login', loginValidation, loginAdmin);
router.post('/logout', logoutAdmin);
router.post('/refresh', refreshAdminToken);
router.post('/forgot-password', forgotPasswordValidation, forgotPasswordAdmin);
router.put('/reset-password/:token', resetPasswordValidation, resetPasswordAdmin);
router.get('/profile', protect, getAdminProfile);

module.exports = router;
