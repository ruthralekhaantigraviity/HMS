const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Registration Route (Usually by SuperAdmin)
router.post('/register', protect, authorize('superadmin'), authController.register);

// Get All Users
router.get('/', protect, authorize('superadmin', 'subadmin'), authController.getUsers);

// Login (Step 1)
router.post('/login', authController.login);

// Verify OTP (Step 2)
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;
