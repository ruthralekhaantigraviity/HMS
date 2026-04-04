const mongoose = require('mongoose');
const User = require('./backend/models/User');

const mongoURI = 'mongodb://127.0.0.1:27017/hms';

async function checkUsers() {
  await mongoose.connect(mongoURI);
  const users = await User.find({}, 'email role name');
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

checkUsers();
