const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST api/attendance
// @desc    Mark attendance for a user (SuperAdmin/SubAdmin only)
router.post('/', protect, authorize('superadmin', 'subadmin'), attendanceController.markAttendance);

// @route   GET api/attendance/today
// @desc    Get all attendance records for today (SuperAdmin/SubAdmin only)
router.get('/today', protect, authorize('superadmin', 'subadmin', 'reception'), attendanceController.getTodayAttendance);

// @route   GET api/attendance/date/:date
// @desc    Get all attendance records for a specific date
// @route   GET api/attendance/me
// @desc    Get current user's attendance for the month
router.get('/me', protect, attendanceController.getMyAttendance);

// @route   POST api/attendance/mark-me
// @desc    Mark own attendance for today
router.post('/mark-me', protect, attendanceController.markMyAttendance);

module.exports = router;
