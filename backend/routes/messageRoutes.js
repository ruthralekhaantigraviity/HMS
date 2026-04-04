const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/contacts', protect, messageController.getContacts);
router.get('/:userId', protect, messageController.getMessages);
router.post('/', protect, messageController.sendMessage);

module.exports = router;
