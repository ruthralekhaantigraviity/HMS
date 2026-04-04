const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payoutController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all payout history
router.get('/', protect, authorize('superadmin', 'subadmin'), payoutController.getPayoutHistory);

// Release salary
router.post('/release', protect, authorize('superadmin', 'subadmin'), payoutController.releaseSalary);

// Get current user's payout history
router.get('/me', protect, payoutController.getMyPayouts);

module.exports = router;
