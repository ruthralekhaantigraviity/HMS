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
    console.log(`[EMAIL SUCCESS] OTP sent to ${to}`);
    return true;
  } catch (err) {
    console.error('--- EMAIL SMTP FAILURE ---');
    console.error('Error:', err.message);
    console.error(`[MOCK EMAIL FALLBACK] To: ${to}, OTP: ${otp}`);
    console.error('Please check your .env EMAIL_USER and EMAIL_PASS if you expect real emails.');
    console.error('---------------------------');
    return true; // Return true to allow login with the mock OTP
  }
};

// @route   POST api/auth/login
// @desc    Step 1: Validate Email/Password and send OTP
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email?.trim().toLowerCase();
  console.log(`[LOGIN DEBUG] Incoming Email: "${email}", Password Length: ${password?.length}`);
  console.log(`[LOGIN DEBUG] Cleaned Email: "${cleanEmail}"`);

  try {
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      console.log(`[LOGIN DEBUG] User NOT found for email: "${cleanEmail}"`);
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    console.log(`[LOGIN DEBUG] User found: ${user.email}, Role: ${user.role}`);
    const isMatch = await user.comparePassword(password);
    console.log(`[LOGIN DEBUG] Password match: ${isMatch}`);

    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    // If staff role, skip OTP and return token immediately
    if (['housekeeping', 'roomservice', 'reception', 'subadmin'].includes(user.role)) {
      const payload = { id: user._id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
      return res.json({ 
        token, 
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        msg: 'Login successful' 
      });
    }

    // Generate OTP for Admins/Reception (Use static 111111 in development)
    const otp = process.env.NODE_ENV === 'development' ? '111111' : generateOTP();
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
    
    // Bypass OTP check in development mode
    const isDev = process.env.NODE_ENV === 'development';
    const isValidOTP = user && user.otp === otp && user.otpExpires > Date.now();

    if (!isDev && (!user || !isValidOTP)) {
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
  const cleanEmail = email?.trim().toLowerCase();
  const creatorRole = req.user.role;

  try {
    // Role Hierarchy Check: Only SuperAdmin can create other Admins/SubAdmins
    if (creatorRole === 'subadmin' && (role === 'superadmin' || role === 'subadmin')) {
      return res.status(403).json({ msg: 'Forbidden: You cannot create administrative roles.' });
    }

    let user = await User.findOne({ email: cleanEmail });
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
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
// @route   PUT api/auth/:id
// @desc    Update user details
exports.updateUser = async (req, res) => {
  const { name, email, role, permissions, phone, location, aadhar, pan, salary, password } = req.body;
  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (permissions) user.permissions = permissions;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (aadhar) user.aadhar = aadhar;
    if (pan) user.pan = pan;
    if (salary) user.salary = salary;
    
    // Update password if provided
    if (password) {
      user.password = password;
      user.plainPassword = password;
    }

    await user.save();
    res.json({ msg: 'User updated successfully', user });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/auth/:id
// @desc    Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    // Prevent self-deletion if necessary (optional)
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'Cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User removed successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
