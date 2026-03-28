const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

const seedData = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/hms');
        console.log('Connected to DB...');

        const customers = [
            { name: 'Rahul Sharma', phone: '+91 9876543210', email: 'rahul@example.com', idProof: 'Aadhar 1234-5678-9012' },
            { name: 'Priya Singh', phone: '+91 8765432109', email: 'priya.s@gmail.com', idProof: 'PAN BK89754' },
            { name: 'Amit Patel', phone: '+91 7654321098', email: 'amit.patel@outlook.com', idProof: 'Voter ID XV12' },
            { name: 'Anjali Gupta', phone: '+91 6543210987', email: 'anjali.g@gmail.com', idProof: 'Aadhar 9988-7766-5544' },
            { name: 'Vikram Malhotra', phone: '+91 9988776655', email: 'vikram.m@industry.com', idProof: 'DL MH-12-2022-005' },
        ];

        const createdCustomers = await Customer.insertMany(customers);
        console.log(`Added ${createdCustomers.length} Customers.`);

        const rooms = await Room.find();
        if (rooms.length >= 3) {
            rooms[0].status = 'Waiting'; 
            rooms[1].status = 'Maintenance'; 
            rooms[2].status = 'Occupied';  
            await Promise.all(rooms.map(r => r.save()));
            console.log('Updated room statuses for demonstration.');
        }

        const bookings = [
            {
                customer: createdCustomers[0]._id,
                room: rooms[2]._id,
                checkIn: new Date(),
                totalAmount: 1800,
                status: 'Active',
                paymentStatus: 'Paid'
            },
            {
                customer: createdCustomers[1]._id,
                room: rooms[1]._id,
                checkIn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 
                checkOut: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 
                totalAmount: 3200,
                status: 'Completed',
                paymentStatus: 'Paid'
            }
        ];

        await Booking.insertMany(bookings);
        console.log('Added sample Bookings.');

        console.log('Seeding Complete!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
