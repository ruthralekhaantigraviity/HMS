const mongoose = require('mongoose');
const mongoURI = 'mongodb://127.0.0.1:27017/hms';

const checkUsers = async () => {
  try {
    await mongoose.connect(mongoURI);
    const User = require('../models/User');
    const users = await User.find({}, { email: 1, role: 1, name: 1 });
    console.log('Current Users in DB:');
    console.table(users.map(u => ({ name: u.name, email: u.email, role: u.role })));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUsers();
