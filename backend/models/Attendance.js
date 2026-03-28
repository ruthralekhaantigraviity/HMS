const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    // Store only the date part (normalized to midnight)
    index: true
  },
  status: {
    type: String,
    enum: ['Present', 'Leave', 'Absent'],
    default: 'Present'
  }
}, { timestamps: true });

// Ensure a user can only have one attendance record per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
