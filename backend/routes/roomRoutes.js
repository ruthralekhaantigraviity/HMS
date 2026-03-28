const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all rooms (Available to all logged-in users)
router.get('/', protect, roomController.getRooms);

// Add, Update, Delete (Restricted to Admins)
router.post('/', protect, authorize('superadmin', 'subadmin'), roomController.addRoom);
router.put('/:id', protect, authorize('superadmin', 'subadmin'), roomController.updateRoom);
router.delete('/:id', protect, authorize('superadmin', 'subadmin'), roomController.deleteRoom);

module.exports = router;
