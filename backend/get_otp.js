const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb+srv://admin:hmsadmin@hms-cluster.t9z4s.mongodb.net/hms')
  .then(async () => {
    const user = await User.findOne({ email: 'admin@hms.com' });
    if (user) {
      console.log('OTP for admin@hms.com:', user.otp);
    } else {
      console.log('User not found');
    }
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
