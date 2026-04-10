const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const customerController = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Customer Enrollment
router.post('/enroll', protect, authorize('reception', 'superadmin', 'subadmin'), customerController.enrollCustomer);
router.get('/customers', protect, customerController.getCustomers);
router.get('/customers/search', protect, customerController.searchByPhone);

// Booking
router.post('/check-in', protect, authorize('reception', 'superadmin', 'subadmin'), bookingController.checkIn);
router.put('/:id/add-service', protect, authorize('reception', 'superadmin', 'subadmin'), bookingController.addService);
router.put('/:id/extend', protect, authorize('reception', 'superadmin', 'subadmin'), bookingController.extendStay);
router.put('/:id/check-out', protect, authorize('reception', 'superadmin', 'subadmin'), bookingController.checkOut);
router.get('/active', protect, bookingController.getActiveBookings);
router.get('/summary', protect, authorize('superadmin', 'subadmin', 'reception'), bookingController.getBookingSummary);

// Room Service Tasks
router.get('/services/pending', protect, bookingController.getPendingServices);
router.patch('/:bookingId/services/:serviceId', protect, bookingController.updateServiceStatus);

module.exports = router;
