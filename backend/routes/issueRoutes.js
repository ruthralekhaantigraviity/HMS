const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  createIssue, 
  getIssues, 
  updateIssueStatus 
} = require('../controllers/issueController');

// @route   POST api/issues
// @desc    Report a new issue
// @access  Private (Any authenticated staff)
router.post('/', protect, createIssue);

// @route   GET api/issues
// @desc    View all issues
// @access  Private (Any authenticated staff)
router.get('/', protect, getIssues);

// @route   PUT api/issues/:id
// @desc    Update status of an issue
// @access  Private (SuperAdmin & SubAdmin only)
router.put('/:id', protect, authorize('superadmin', 'subadmin'), updateIssueStatus);

module.exports = router;
