const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoURI = 'mongodb://127.0.0.1:27017/hms';
const receptionistData = {
  name: 'HMS Receptionist',
  email: 'reception@hms.com',
  password: 'password123',
  role: 'reception',
  isVerified: true
};

mongoose.connect(mongoURI)
  .then(async () => {
    const User = require('./models/User');
    
    // Remove if exists
    await User.deleteOne({ email: receptionistData.email });
    
    // Create new
    const user = new User(receptionistData);
    await user.save();
    
    console.log(`\nDONE! Receptionist Account Created Successfully.`);
    console.log(`-----------------------------------`);
    console.log(`Email:    reception@hms.com`);
    console.log(`Password: password123`);
    console.log(`Role:     reception`);
    console.log(`-----------------------------------\n`);
    
    process.exit();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
