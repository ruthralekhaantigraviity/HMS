const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoURI = 'mongodb://127.0.0.1:27017/hms';
const email = 'admin@hms.com';
const password = 'password123';

const verify = async () => {
  try {
    await mongoose.connect(mongoURI);
    const User = require('./models/User');
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`USER NOT FOUND: ${email}`);
    } else {
      const isMatch = await user.comparePassword(password);
      console.log(`USER FOUND: ${user.email}`);
      console.log(`ROLE: ${user.role}`);
      console.log(`PASSWORD HASH: ${user.password}`);
      console.log(`PASSWORD MATCH: ${isMatch}`);
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
