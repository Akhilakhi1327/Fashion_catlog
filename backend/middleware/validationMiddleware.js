const { body, validationResult } = require('express-validator');

// Error responder middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return res.json({
      success: false,
      message: errors.array()[0].msg, // Return the first error message
      errors: errors.array()
    });
  }
  next();
};

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

const verifyOTPValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP code is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must be numeric'),
  validate
];

const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  validate
];

const resetPasswordValidation = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
];

const createOrderValidation = [
  body('customerName')
    .trim()
    .notEmpty().withMessage('Customer name is required')
    .isLength({ min: 2 }).withMessage('Customer name must be at least 2 characters'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be a valid 10-digit number'),
  body('address')
    .trim()
    .notEmpty().withMessage('Delivery address is required'),
  body('orderItems')
    .isArray({ min: 1 }).withMessage('At least one order item is required'),
  body('orderItems.*.product')
    .notEmpty().withMessage('Product ID is required for each item')
    .isMongoId().withMessage('Invalid Product ID format'),
  body('orderItems.*.qty')
    .isInt({ min: 1 }).withMessage('Quantity must be an integer >= 1'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  verifyOTPValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  createOrderValidation
};
