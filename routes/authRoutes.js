const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/rateLimiter');
const { refreshToken } = require('../controllers/authController');
const {
  register,
  login,
  getMe,
  updateUserProfile,
  sendOtp,
  verifyOtpAndReset
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// Auth Routes
router.post('/register', register);
router.get('/me', protect, getMe);
router.put('/update', protect, updateUserProfile);
router.post('/reset-password', verifyOtpAndReset);
router.post('/login', authLimiter, login);
router.post('/send-otp', authLimiter, sendOtp);
router.post('/refresh-token', refreshToken);


module.exports = router;
