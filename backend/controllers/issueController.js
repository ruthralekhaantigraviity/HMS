const Issue = require('../models/Issue');

// @route   POST api/issues
// @desc    Create a new report issue
// @access  Private
exports.createIssue = async (req, res) => {
  try {
    const { roomNumber, category, priority, description } = req.body;
    
    // Create new issue. Reporter is taken from the authenticated user (req.user.id)
    const newIssue = new Issue({
      reporter: req.user.id,
      roomNumber,
      category,
      priority,
      description
    });

    const issue = await newIssue.save();
    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/issues
// @desc    Get all issues (for admin/sub-admin)
// @access  Private
exports.getIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('reporter', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json(issues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/issues/:id
// @desc    Update issue status
// @access  Private
exports.updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Only allow admin and subadmin to update status
    if (req.user.role !== 'superadmin' && req.user.role !== 'subadmin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!issue) return res.status(404).json({ msg: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
