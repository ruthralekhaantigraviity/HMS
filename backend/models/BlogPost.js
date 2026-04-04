const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String }, // URL to blog post image
  author: { type: String, default: 'Admin' },
  date: { type: Date, default: Date.now },
  category: { type: String, enum: ['Luxury', 'Business', 'Travel', 'Events'], default: 'Luxury' }
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
