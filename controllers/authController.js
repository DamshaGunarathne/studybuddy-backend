const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail'); // You can build this with nodemailer
const crypto = require('crypto');

// JWT generator
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// ✅ Register user with validation
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  console.log('📦 Request Body:', req.body);

  // 🚨 Basic presence checks
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // ✉️ Email format validation
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // 🔐 Password strength check
  if (!validator.isStrongPassword(password, { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
    return res.status(400).json({
      error: 'Password must include at least 1 uppercase, 1 lowercase, and 1 number',
    });
  }

  try {
    // 🔁 Check for duplicate email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // ✅ Create user
    const newUser = await User.create({ username, email, password });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        token: generateToken(newUser._id),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Login user
// ✅ Login user with refresh token
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // 🚨 Check for empty fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // ✉️ Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // 🔎 Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 🔐 Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ✅ Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, {
      expiresIn: '30d',
    });

    // 💾 Save refreshToken to DB
    user.refreshToken = refreshToken;
    await user.save();

    // 🍪 Set refresh token as secure cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        token: accessToken,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    }
  });
};
// ✅ Update user profile
exports.updateUserProfile = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password; // pre-save hook will hash it

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({ email, code: otpCode });

    await sendEmail({
      to: email,
      subject: 'Your OTP for StudyBuddy',
      text: `Your OTP code is: ${otpCode}`,
    });

    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};
exports.verifyOtpAndReset = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const otp = await Otp.findOne({ email, code });
    if (!otp) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.password = newPassword;
    await user.save();
    await Otp.deleteOne({ _id: otp._id }); // clean up OTP

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: 'Could not reset password' });
  }
};
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'Refresh token missing' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.json({ token: newAccessToken });
  } catch (err) {
    res.status(401).json({ error: 'Token expired or invalid' });
  }
};



