const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  minStock: { type: Number, required: true, default: 10 },
  unit: { type: String, default: 'pcs' },
  status: { type: String, enum: ['In Stock', 'Low Stock', 'Restock Required'], default: 'In Stock' },
}, { timestamps: true });

// Middleware to update status based on stock vs minStock
inventorySchema.pre('save', function() {
  if (this.stock <= 0) {
    this.status = 'Restock Required';
  } else if (this.stock < this.minStock) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);
