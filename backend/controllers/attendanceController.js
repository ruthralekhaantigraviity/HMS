const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @route   POST api/attendance
// @desc    Mark attendance for a user (Upsert)
exports.markAttendance = async (req, res) => {
  const { userId, status } = req.body;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Find and update or create new
    const attendance = await Attendance.findOneAndUpdate(
      { user: userId, date: today },
      { status },
      { new: true, upsert: true }
    );

    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/attendance/today
// @desc    Get all attendance records for today
exports.getTodayAttendance = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const records = await Attendance.find({ date: today }).populate('user', 'name role');
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/attendance/date/:date
// @desc    Get all attendance records for a specific date
exports.getAttendanceByDate = async (req, res) => {
  const { date } = req.params;
  const [year, month, day] = date.split('-').map(Number);
  const queryDate = new Date(year, month - 1, day);
  queryDate.setHours(0, 0, 0, 0);

  try {
    const records = await Attendance.find({ date: queryDate }).populate('user', 'name role');
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching attendance for this date' });
  }
};
// @route   GET api/attendance/me
// @desc    Get current user's attendance for the current month
exports.getMyAttendance = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const records = await Attendance.find({
      user: req.user.id,
      date: { $gte: startOfMonth }
    }).sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/attendance/mark-me
// @desc    Employee marks their own attendance for today
exports.markMyAttendance = async (req, res) => {
  const { status } = req.body; // Usually 'Present'
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const attendance = await Attendance.findOneAndUpdate(
      { user: req.user.id, date: today },
      { status: status || 'Present' },
      { new: true, upsert: true }
    );
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
