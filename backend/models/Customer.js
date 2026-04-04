const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  identityType: { type: String },
  identityNumber: { type: String },
  identityImage: { type: String }, // Base64
  location: { type: String },
  alternatePhone: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
