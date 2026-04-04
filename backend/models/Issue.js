const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  reporter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  roomNumber: { 
    type: String, 
    required: false 
  },
  category: { 
    type: String, 
    enum: ['Maintenance', 'IT', 'Housekeeping', 'Billing', 'Other'], 
    default: 'Other' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Urgent'], 
    default: 'Medium' 
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved'], 
    default: 'Open' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
