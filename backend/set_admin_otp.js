const mongoose = require('mongoose');

const mongoURI = 'mongodb://127.0.0.1:27017/hms';
const adminEmail = 'admin@hms.com';
const tempOTP = '999999';

mongoose.connect(mongoURI)
  .then(async () => {
    // We'll use the collection directly to avoid path issues with the model
    const User = mongoose.connection.collection('users');
    const result = await User.updateOne(
      { email: adminEmail },
      { 
        $set: { 
          otp: tempOTP, 
          otpExpires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour 
        } 
      }
    );

    if (result.matchedCount > 0) {
      console.log(`Successfully set OTP for ${adminEmail} to ${tempOTP}`);
    } else {
      console.log(`User ${adminEmail} not found`);
    }
    process.exit();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
