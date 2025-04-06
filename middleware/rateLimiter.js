const rateLimit = require('express-rate-limit');

// For login & OTP routes
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many attempts, please try again later.' }
});
