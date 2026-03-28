const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkIn: { type: Date, default: Date.now },
  checkOut: { type: Date },
  expectedCheckOut: { type: Date },
  duration: { type: Number }, // in hours
  stayDays: { type: Number, default: 1 },
  penaltyAmount: { type: Number, default: 0 },
  penaltyReason: { type: String },
  isKeyReturned: { type: Boolean, default: false },
  isPropertyDamaged: { type: Boolean, default: false },
  totalAmount: { type: Number },
  paymentStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['Cash', 'Online'] },
  status: { type: String, enum: ['Active', 'Completed', 'Cancelled', 'Expiring'], default: 'Active' },
  additionalServices: [
    {
      name: { type: String },
      price: { type: Number },
      isPaid: { type: Boolean, default: false }
    }
  ],
  gstAmount: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
