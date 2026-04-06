require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Room = require('../models/Room');
const BlogPost = require('../models/BlogPost');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hms';

const luxuryRooms = [
  {
    roomNumber: '101',
    floor: 1,
    type: 'Suite',
    category: 'AC',
    price: 350,
    description: 'Executive suite with modern minimalist design and floor-to-ceiling windows.',
    image: '/assets/images/room1.png',
    bedType: 'King',
    capacity: 2,
    size: 550,
    view: 'City Skyline'
  },
  {
    roomNumber: '102',
    floor: 1,
    type: 'Deluxe',
    category: 'AC',
    price: 250,
    description: 'Spacious deluxe room with premium finishes and a luxury bathtub.',
    image: '/assets/images/room2.png',
    bedType: 'King',
    capacity: 2,
    size: 450,
    view: 'Garden'
  },
  {
    roomNumber: '201',
    floor: 2,
    type: 'Double',
    category: 'AC',
    price: 180,
    description: 'Modern double room perfect for business travelers.',
    image: '/assets/images/room1.png',
    bedType: 'Double',
    capacity: 2,
    size: 350,
    view: 'City'
  }
];

const blogPosts = [
  {
    title: 'The Art of Fine Dining at Glitz',
    content: 'Experience the exquisite culinary delights prepared by our Michelin-starred chefs in the heart of the city.',
    image: '/assets/images/restaurant.png',
    author: 'Admin',
    category: 'Luxury'
  },
  {
    title: 'Wellness & Relaxation',
    content: 'Unwind at our premium spa and wellness center, designed to provide the ultimate relaxation experience.',
    image: '/assets/images/lobby.png',
    author: 'Staff',
    category: 'Travel'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Add rooms (using updateOne to avoid duplicates if roomNumber exists)
    for (const room of luxuryRooms) {
      await Room.updateOne({ roomNumber: room.roomNumber }, { $set: room }, { upsert: true });
    }
    console.log('Luxury rooms seeded');

    // Add blog posts
    await BlogPost.deleteMany(); // Clear old posts for demo
    await BlogPost.insertMany(blogPosts);
    console.log('Blog posts seeded');

    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
