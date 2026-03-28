const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, inventoryController.getItems);

// Update/Add/Delete Restricted to Admins/Reception
router.post('/', protect, authorize('superadmin', 'subadmin', 'reception'), inventoryController.addItem);
router.put('/:id', protect, authorize('superadmin', 'subadmin', 'reception'), inventoryController.updateItem);
router.delete('/:id', protect, authorize('superadmin', 'subadmin', 'reception'), inventoryController.deleteItem);

module.exports = router;
