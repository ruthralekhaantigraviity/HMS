const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get Summary (Restricted to Super Admin)
router.get('/summary', protect, authorize('superadmin'), financialController.getSummary);

// Add Expense (Restricted to Admins)
router.post('/expense', protect, authorize('superadmin', 'subadmin'), financialController.addExpense);

module.exports = router;
