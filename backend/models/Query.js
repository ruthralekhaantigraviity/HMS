const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['New', 'In Progress', 'Resolved', 'Archived'], 
    default: 'New' 
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Query', querySchema);
