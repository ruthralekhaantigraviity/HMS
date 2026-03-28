const User = require('../models/User');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');

// Helper to generate OTP
const generateOTP = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    digits: true
  });
};

// Helper to send Email (Mocked if no credentials)
const sendEmail = async (to, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[MOCK EMAIL] To: ${to}, OTP: ${otp}`);
    return true;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your HMS Login OTP',
    text: `Your OTP for login is: ${otp}. It will expire in 10 minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Email Error:', err);
    return false;
  }
};

// @route   POST api/auth/login
// @desc    Step 1: Validate Email/Password and send OTP
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // Send Email
    await sendEmail(user.email, otp);

    res.json({ msg: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   POST api/auth/verify-otp
// @desc    Step 2: Verify OTP and provide JWT
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or Expired OTP' });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    // Generate JWT
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   POST api/auth/register
// @desc    Register a new user (Usually done by Admin)
exports.register = async (req, res) => {
  const { name, email, password, role, permissions } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ 
      name, 
      email, 
      password: password || 'password123', 
      role, 
      permissions: permissions || [],
      isVerified: true 
    });
    await user.save();

    res.json({ msg: 'User created successfully', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   GET api/auth
// @desc    Get all users (SuperAdmin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
