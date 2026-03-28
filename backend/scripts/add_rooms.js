const mongoose = require('mongoose');

const mongoURI = 'mongodb://127.0.0.1:27017/hms';

const newRooms = [
  { roomNumber: '104', floor: 1, type: 'Single', category: 'AC', status: 'Available', price: 1500 },
  { roomNumber: '105', floor: 1, type: 'Double', category: 'NON-AC', status: 'Available', price: 1200 },
  { roomNumber: '203', floor: 2, type: 'Suite', category: 'AC', status: 'Available', price: 3500 },
  { roomNumber: '204', floor: 2, type: 'Double', category: 'AC', status: 'Available', price: 2500 },
  { roomNumber: '301', floor: 3, type: 'Deluxe', category: 'AC', status: 'Available', price: 4500 },
  { roomNumber: '302', floor: 3, type: 'Single', category: 'NON-AC', status: 'Available', price: 1000 },
  { roomNumber: '303', floor: 3, type: 'Double', category: 'AC', status: 'Available', price: 2800 },
];

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const Room = mongoose.connection.collection('rooms');
    
    for (const roomData of newRooms) {
      const exists = await Room.findOne({ roomNumber: roomData.roomNumber });
      if (!exists) {
        await Room.insertOne({
          ...roomData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Added Room ${roomData.roomNumber}`);
      } else {
        console.log(`Room ${roomData.roomNumber} already exists`);
      }
    }
    
    console.log('Finished updating rooms.');
    process.exit();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
