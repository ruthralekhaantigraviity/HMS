const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoURI = 'mongodb://127.0.0.1:27017/hms';
const subadminData = {
  name: 'Sub Admin',
  email: 'subadmin@hms.com',
  password: 'password123',
  role: 'subadmin'
};
const tempOTP = '777777';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const User = mongoose.connection.collection('users');
    
    const exists = await User.findOne({ email: subadminData.email });
    
    const hashedPassword = await bcrypt.hash(subadminData.password, 10);
    
    if (exists) {
      await User.updateOne(
        { email: subadminData.email },
        { $set: { 
            otp: tempOTP, 
            isVerified: true, 
            otpExpires: new Date(Date.now() + 3600000) 
          } 
        }
      );
      console.log(`Updated existing subadmin ${subadminData.email} with OTP ${tempOTP}`);
    } else {
      await User.insertOne({
        ...subadminData,
        password: hashedPassword,
        otp: tempOTP,
        isVerified: true,
        otpExpires: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Created new subadmin ${subadminData.email} with OTP ${tempOTP}`);
    }
    
    process.exit();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
