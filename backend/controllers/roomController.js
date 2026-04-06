const Room = require('../models/Room');

// @route   GET api/rooms
// @desc    Get all rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   POST api/rooms
// @desc    Add a new room
exports.addRoom = async (req, res) => {
  const { roomNumber, floor, type, category, price, description } = req.body;
  try {
    // Basic validation
    if (!roomNumber || floor === undefined || price === undefined) {
      return res.status(400).json({ msg: 'Missing required fields: roomNumber, floor, and price' });
    }

    let room = await Room.findOne({ roomNumber });
    if (room) return res.status(400).json({ msg: `Room ${roomNumber} already exists in the system` });

    room = new Room({ 
      roomNumber, 
      floor: Number(floor), 
      type, 
      category, 
      price: Number(price), 
      description 
    });
    
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    console.error('Add Room Error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: Object.values(err.errors).map(val => val.message).join(', ') });
    }
    res.status(500).json({ msg: 'Server connectivity error. Please try again later.' });
  }
};

// @route   PUT api/rooms/:id
// @desc    Update a room
exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ msg: 'Room not found' });

    // Handle numeric casting if present in update body
    const updateData = { ...req.body };
    if (updateData.floor !== undefined) updateData.floor = Number(updateData.floor);
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);

    room = await Room.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
    res.json(room);
  } catch (err) {
    console.error('Update Room Error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: Object.values(err.errors).map(val => val.message).join(', ') });
    }
    res.status(500).json({ msg: 'Server error while updating room' });
  }
};

// @route   DELETE api/rooms/:id
// @desc    Delete a room
exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Room deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
