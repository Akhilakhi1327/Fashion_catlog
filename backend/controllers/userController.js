const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger');

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  logger.info(`User registration attempt: ${email}`);

  const userExists = await User.findOne({ email });

  if (userExists) {
    if (userExists.isVerified) {
      res.status(400);
      throw new Error('User already exists');
    }
    
    // User exists but is not verified: update details and send new OTP
    logger.info(`Unverified user exists. Updating details and sending new OTP for: ${email}`);
    
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`[DEV/TEST] OTP for ${email}: ${otpCode}`);

    userExists.name = name;
    userExists.password = password; // Hashed by pre-save hook
    userExists.otpCode = otpCode;
    userExists.otpExpires = otpExpires;
    
    await userExists.save();

    const message = `
      <h1>Email Verification</h1>
      <p>Hello ${name},</p>
      <p>Your OTP for email verification is: <strong>${otpCode}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `;

    try {
      await sendEmail({
        email: userExists.email,
        subject: 'Elite Fashion - Verify Your Email',
        html: message,
      });
      return res.status(200).json({
        message: 'Registration successful. Please check your email for the OTP.',
        email: userExists.email,
      });
    } catch (error) {
      console.error(error);
      res.status(500);
      throw new Error('Email could not be sent. Please try again later.');
    }
  }

  // Generate secure 6-digit OTP
  const otpCode = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  console.log(`[DEV/TEST] OTP for ${email}: ${otpCode}`);

  const user = await User.create({
    name,
    email,
    password,
    isVerified: false,
    otpCode,
    otpExpires,
  });

  if (user) {
    // Send email
    const message = `
      <h1>Email Verification</h1>
      <p>Hello ${name},</p>
      <p>Your OTP for email verification is: <strong>${otpCode}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Elite Fashion - Verify Your Email',
        html: message,
      });
      res.status(201).json({
        message: 'Registration successful. Please check your email for the OTP.',
        email: user.email,
      });
    } catch (error) {
      console.error(error);
      res.status(500);
      throw new Error('Email could not be sent. Please try again later.');
    }
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  logger.info(`User login attempt: ${email}`);

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    logger.warn(`Failed user login attempt for: ${email}`);
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isVerified) {
    res.status(401);
    throw new Error('Email not verified. Please verify your email first.');
  }

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token in database
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  logger.info(`User login successful: ${user.email}`);
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('User is already verified');
  }

  if (user.otpCode !== otp || user.otpExpires < Date.now()) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

// @desc    Forgot Password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('There is no user with that email');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // Create reset url
  // Note: in a real app, use the actual frontend URL from env
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const message = `
    <h1>Password Reset Request</h1>
    <p>You are receiving this because you (or someone else) requested a password reset for your account.</p>
    <p>Please click on the following link, or paste it into your browser to complete the process within one hour of receiving it:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Elite Fashion - Password Reset Link',
      html: message,
    });

    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    console.error(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset Password
// @route   PUT /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }

  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images category stock');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({ success: true, data: user.wishlist });
});

// @desc    Toggle product in wishlist
// @route   POST /api/users/wishlist/:id
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.id;

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isLiked = user.wishlist.includes(productId);

  if (isLiked) {
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();

  // Return updated wishlist populated
  const updatedUser = await User.findById(req.user._id).populate('wishlist', 'name price images category stock');

  res.status(200).json({
    success: true,
    message: isLiked ? 'Removed from wishlist' : 'Added to wishlist',
    data: updatedUser.wishlist,
  });
});

// @desc    Refresh User Access Token
// @route   POST /api/users/refresh
// @access  Public
const refreshUserToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401);
    throw new Error('No refresh token provided');
  }

  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }

  const jwt = require('jsonwebtoken');
  try {
    jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Generate new access and refresh tokens (rotation)
    const token = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Rotate token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Send new refresh token in secure cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Refresh access token cookie
    res.cookie('token', token, {
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  verifyOTP,
  forgotPassword,
  resetPassword,
  getWishlist,
  toggleWishlist,
  refreshUserToken,
};
