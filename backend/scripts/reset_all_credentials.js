const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoURI = 'mongodb://127.0.0.1:27017/hms';
const password = 'password123';
const staticOTP = '111111';

const users = [
  { name: 'Super Admin', email: 'admin@hms.com', role: 'superadmin' },
  { name: 'Sub Admin', email: 'subadmin@hms.com', role: 'subadmin' },
  { name: 'Receptionist', email: 'reception@hms.com', role: 'reception' },
  { name: 'Staff User', email: 'staff@hms.com', role: 'housekeeping' }
];

const seed = async () => {
  try {
    await mongoose.connect(mongoURI);
    const User = require('../models/User');
    
    // Clear existing test users
    const emails = users.map(u => u.email);
    await User.deleteMany({ email: { $in: emails } });
    
    // Add all users
    for (const data of users) {
      const user = new User({
        ...data,
        password: password, // This will be hashed by the User.js pre-save hook
        isVerified: true,
        otp: staticOTP,
        otpExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
      await user.save();
      console.log(`Created: ${data.email} (${data.role})`);
    }
    
    console.log('\nAll test credentials have been reset successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
