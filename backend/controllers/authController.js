const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

// Helper to write audit log entries
const logAction = async (req, admin, action, details) => {
  try {
    await AuditLog.create({
      action,
      admin: admin._id,
      adminName: admin.name,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  } catch (err) {
    console.error('AuditLog logging failed:', err.message);
  }
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find admin with password field included
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

  if (!admin) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    logger.warn(`Failed admin login attempt for email: ${email}`);
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(admin._id);
  const refreshToken = generateRefreshToken(admin._id);

  // Save refresh token in database
  admin.refreshToken = refreshToken;
  await admin.save();

  // Send refresh token as secure cookie
  res.cookie('adminRefreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Send access token as adminToken cookie
  res.cookie('adminToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Log audit entry
  logger.info(`Admin login successful: ${admin.email} from IP: ${req.ip}`);
  await logAction(req, admin, 'ADMIN_LOGIN', `Admin logged in successfully from IP: ${req.ip}`);

  res.status(200).json({
    success: true,
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token,
    },
  });
});

// @desc    Refresh Admin Access Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAdminToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.adminRefreshToken;

  if (!refreshToken) {
    res.status(401);
    throw new Error('No refresh token provided');
  }

  const admin = await Admin.findOne({ refreshToken });

  if (!admin) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }

  const jwt = require('jsonwebtoken');
  try {
    // Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Generate new access and refresh tokens
    const token = generateToken(admin._id);
    const newRefreshToken = generateRefreshToken(admin._id);

    // Rotate token in database
    admin.refreshToken = newRefreshToken;
    await admin.save();

    // Send new refresh token in secure cookie
    res.cookie('adminRefreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Refresh access token cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      token,
    });
  } catch (err) {
    res.status(401);
    throw new Error('Refresh token verification failed');
  }
});

// @desc    Logout admin / clear cookies
// @route   POST /api/auth/logout
// @access  Public
const logoutAdmin = asyncHandler(async (req, res) => {
  logger.info(`Admin logout request received`);
  const refreshToken = req.cookies.adminRefreshToken;
  if (refreshToken) {
    const admin = await Admin.findOne({ refreshToken });
    if (admin) {
      admin.refreshToken = undefined;
      await admin.save();
    }
  }

  res.cookie('adminToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.cookie('adminRefreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get admin profile
// @route   GET /api/auth/profile
// @access  Private
const getAdminProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.admin,
  });
});

// @desc    Admin Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPasswordAdmin = asyncHandler(async (req, res) => {
  const { email } = req.body;
  logger.info(`Admin forgot-password requested for email: ${email}`);
  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin) {
    res.status(404);
    throw new Error('There is no administrator with that email');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set reset fields
  admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  admin.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await admin.save();

  // Create reset url
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password/${resetToken}`;

  const message = `
    <h1>Admin Password Reset Request</h1>
    <p>You are receiving this because you (or someone else) requested an administrator password reset.</p>
    <p>Please click on the following link to reset your password within 10 minutes:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>If you did not request this, ignore this email.</p>
  `;

  try {
    await sendEmail({
      email: admin.email,
      subject: 'House Of Induva Admin - Password Reset Link',
      html: message,
    });

    res.status(200).json({ success: true, message: 'Admin password reset email sent' });
  } catch (error) {
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Admin Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPasswordAdmin = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const admin = await Admin.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!admin) {
    res.status(400);
    throw new Error('Invalid or expired password reset token');
  }

  // Set new password
  admin.password = req.body.password;
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpires = undefined;
  await admin.save();

  // Create new JWT sessions
  const token = generateToken(admin._id);
  const refreshToken = generateRefreshToken(admin._id);

  admin.refreshToken = refreshToken;
  await admin.save();

  res.cookie('adminRefreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('adminToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });

  await logAction(req, admin, 'ADMIN_PASSWORD_RESET', `Admin reset password successfully from IP: ${req.ip}`);

  res.status(200).json({
    success: true,
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token,
    },
  });
});

module.exports = {
  loginAdmin,
  refreshAdminToken,
  logoutAdmin,
  getAdminProfile,
  forgotPasswordAdmin,
  resetPasswordAdmin,
};
