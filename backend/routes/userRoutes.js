const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  verifyOTP,
  forgotPassword,
  resetPassword,
  logoutUser,
  getWishlist,
  toggleWishlist,
  refreshUserToken
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const {
  registerValidation,
  loginValidation,
  verifyOTPValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../middleware/validationMiddleware');

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/refresh', refreshUserToken);
router.post('/verify-otp', verifyOTPValidation, verifyOTP);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.put('/reset-password/:token', resetPasswordValidation, resetPassword);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:id', protect, toggleWishlist);

module.exports = router;
