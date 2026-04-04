const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoURI = 'mongodb://127.0.0.1:27017/hms';
const staffData = {
  name: 'Elite Housekeeping',
  email: 'staff@hms.com',
  password: 'password123',
  role: 'housekeeping',
  salary: 12000,
  phone: '9876543210'
};
const tempOTP = '000000';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const User = mongoose.connection.collection('users');
    
    const exists = await User.findOne({ email: staffData.email });
    const hashedPassword = await bcrypt.hash(staffData.password, 10);
    
    if (exists) {
      await User.updateOne(
        { email: staffData.email },
        { $set: { 
            otp: tempOTP, 
            isVerified: true, 
            otpExpires: new Date(Date.now() + 3600000) 
          } 
        }
      );
      console.log(`Updated existing housekeeping ${staffData.email} with OTP ${tempOTP}`);
    } else {
      await User.insertOne({
        ...staffData,
        password: hashedPassword,
        otp: tempOTP,
        isVerified: true,
        otpExpires: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Created new housekeeping user ${staffData.email} with OTP ${tempOTP}`);
    }
    
    process.exit();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
