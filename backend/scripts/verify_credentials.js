require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'admin@hms.com' });
        if (!user) {
            console.log('Admin user not found');
            process.exit(1);
        }
        
        const isMatch = await bcrypt.compare('password123', user.password);
        console.log(`Password match for 'admin@hms.com' with 'password123': ${isMatch}`);
        
        // Let's also check if the email is clean
        console.log(`User email in DB: "${user.email}"`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
