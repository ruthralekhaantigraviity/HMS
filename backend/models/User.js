const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'subadmin', 'reception', 'housekeeping', 'roomservice', 'user'], default: 'reception' },
  permissions: { type: [String], default: [] },
  salary: { type: Number, default: 0 },
  phone: { type: String },
  location: { type: String },
  aadhar: { type: String },
  pan: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  plainPassword: { type: String }, // For administrative reference
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to check password
userSchema.methods.comparePassword = async function(candPass) {
  return await bcrypt.compare(candPass, this.password);
};

module.exports = mongoose.model('User', userSchema);
