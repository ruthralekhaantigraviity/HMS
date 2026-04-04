const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/messages/contacts
// Retrieves list of authorized staff members based on sender's role
exports.getContacts = async (req, res) => {
  try {
    const { role } = req.user;
    let filter = {};

    if (role === 'superadmin') {
      filter = { role: 'subadmin' };
    } else if (role === 'subadmin') {
      filter = { role: { $in: ['superadmin', 'reception', 'housekeeping', 'roomservice'] } };
    } else {
      // All other staff can only see subadmins
      filter = { role: 'subadmin' };
    }

    // Exclude self and get details
    filter._id = { $ne: req.user._id };
    const contacts = await User.find(filter).select('name role email');
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/messages/:userId
// Retrieves chat history between the current user and target user
exports.getMessages = async (req, res) => {
  try {
    const targetId = req.params.userId;
    const currentId = req.user._id;

    // Retrieve messages where either user is the sender/receiver
    const messages = await Message.find({
      $or: [
        { sender: currentId, receiver: targetId },
        { sender: targetId, receiver: currentId }
      ]
    }).sort({ createdAt: 1 });

    // Mark as read if the current user is the receiver
    await Message.updateMany(
      { sender: targetId, receiver: currentId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/messages
// Sends a new message to an authorized target user
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    // Validate Authorization Role-Based
    const sender = req.user;
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: 'Target staff member not found' });
    }

    let authorized = false;
    if (sender.role === 'superadmin' && receiver.role === 'subadmin') authorized = true;
    else if (sender.role === 'subadmin') authorized = true; // Subadmin communicates with everyone authorized in list
    else if (receiver.role === 'subadmin') authorized = true; // Staff can only message subadmin

    if (!authorized) {
      return res.status(403).json({ message: 'You are not authorized to message this role' });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
