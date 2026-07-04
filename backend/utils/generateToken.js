const jwt = require('jsonwebtoken');

// Access Token: expires in 15 minutes (short-lived)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

// Refresh Token: expires in 7 days (long-lived)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = {
  generateToken,
  generateAccessToken: generateToken,
  generateRefreshToken,
};
