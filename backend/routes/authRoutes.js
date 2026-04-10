const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Registration Route (SuperAdmin/SubAdmin can register staff)
router.post('/register', protect, authorize('superadmin', 'subadmin'), authController.register);

// Get All Users (For the Dashboard)
router.get('/', protect, authorize('superadmin', 'subadmin', 'reception'), authController.getUsers);

// Login (Step 1)
router.post('/login', authController.login);

// Verify OTP (Step 2)
router.post('/verify-otp', authController.verifyOTP);

// Update/Delete User (ONLY SuperAdmin)
router.put('/:id', protect, authorize('superadmin'), authController.updateUser);
router.delete('/:id', protect, authorize('superadmin'), authController.deleteUser);

module.exports = router;
