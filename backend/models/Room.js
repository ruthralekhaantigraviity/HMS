const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  floor: { type: Number, required: true },
  type: { type: String, enum: ['Single', 'Double', 'Suite', 'Deluxe'], default: 'Single' },
  category: { type: String, enum: ['AC', 'NON-AC'], default: 'AC' },
  status: { type: String, enum: ['Available', 'Occupied', 'Waiting', 'Maintenance'], default: 'Available' },
  price: { type: Number, required: true },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
