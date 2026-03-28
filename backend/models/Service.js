const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['Food', 'Comfort', 'Tech', 'Beverage', 'Other'], default: 'Other' },
  icon: { type: String, default: 'Utensils' }, // Lucide icon name
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
