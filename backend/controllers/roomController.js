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
    let room = await Room.findOne({ roomNumber });
    if (room) return res.status(400).json({ msg: 'Room already exists' });

    room = new Room({ roomNumber, floor, type, category, price, description });
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/rooms/:id
// @desc    Update a room
exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ msg: 'Room not found' });

    room = await Room.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(room);
  } catch (err) {
    res.status(500).send('Server Error');
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
