const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  floor: { type: Number, required: true },
  type: { type: String, enum: ['Single', 'Double', 'Suite', 'Deluxe'], default: 'Single' },
  category: { type: String, enum: ['AC', 'NON-AC'], default: 'AC' },
  status: { type: String, enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'], default: 'Available' },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  bedType: { type: String },
  capacity: { type: Number },
  size: { type: Number },
  view: { type: String },
  amenities: { 
    type: [String], 
    default: ['WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Safe', 'Room Service'] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
