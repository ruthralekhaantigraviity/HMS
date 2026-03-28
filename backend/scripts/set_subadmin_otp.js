const mongoose = require('mongoose');

const mongoURI = 'mongodb://127.0.0.1:27017/hms';
const subadminEmail = 'manager@hms.com';
const tempOTP = '888888';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const User = mongoose.connection.collection('users');
    
    const result = await User.updateOne(
      { email: subadminEmail },
      { $set: { 
          otp: tempOTP, 
          isVerified: true, 
          otpExpires: new Date(Date.now() + 3600000) 
        } 
      }
    );
    
    if (result.matchedCount > 0) {
      console.log(`OTP for subadmin ${subadminEmail} successfully set to ${tempOTP}`);
    } else {
      console.error(`User with email ${subadminEmail} not found.`);
    }
    
    process.exit();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
