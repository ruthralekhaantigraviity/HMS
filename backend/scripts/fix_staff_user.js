const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoURI = 'mongodb://127.0.0.1:27017/hms';
const staffData = {
  name: 'Elite Housekeeping',
  email: 'staff@hms.com',
  password: 'staff123', // I'm changing it to staff123 for easier testing
  role: 'housekeeping',
  salary: 12000,
  phone: '9876543210',
  isVerified: true
};

mongoose.connect(mongoURI)
  .then(async () => {
    // Import User model via Mongoose for consistent behavior
    const User = require('../models/User');
    
    // Find and Overwrite
    await User.deleteMany({ email: staffData.email });
    
    // Create new via model constructor (so pre-hooks and everything run correctly)
    const newUser = new User(staffData);
    await newUser.save();
    
    console.log(`\nDONE! Staff User Reset Successfully.`);
    console.log(`-----------------------------------`);
    console.log(`Email:    staff@hms.com`);
    console.log(`Password: staff123`);
    console.log(`Role:     housekeeping`);
    console.log(`OTP:      (Skipped for this role)`);
    console.log(`-----------------------------------\n`);
    
    process.exit();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
