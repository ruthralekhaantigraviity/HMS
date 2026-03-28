const mongoose = require('mongoose');

const financialSchema = new mongoose.Schema({
  type: { type: String, enum: ['Revenue', 'Expense'], required: true },
  category: { type: String, enum: ['Booking', 'Service', 'Salary', 'Maintenance', 'Utility', 'Other'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Financial', financialSchema);
