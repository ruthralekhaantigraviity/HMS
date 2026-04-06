const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Customer = require('../models/Customer');
const financialController = require('./financialController');

// @route   POST api/bookings/check-in
// @desc    Start booking and occupy room
exports.checkIn = async (req, res) => {
  const { 
    customerId, roomId, checkIn, duration, totalAmount, additionalServices, 
    gstAmount, paymentMethod, alternatePhone, vehicleType, vehicleNumber, 
    guestCount, additionalGuests, isKids, kidsAge, isPets, 
    isKitchenAllowance, hasGst, gstRate 
  } = req.body;
  
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ msg: 'Target Room not found in database' });
    }
    
    if (room.status !== 'Available') {
      return res.status(400).json({ msg: `Room ${room.roomNumber} is currently ${room.status}. Please select an Available room.` });
    }

    const checkInDate = checkIn ? new Date(checkIn) : new Date();
    
    // Calculate Expected Checkout
    const expected = new Date(checkInDate);
    expected.setDate(expected.getDate() + Number(req.body.stayDays || 1));
    expected.setHours(11, 0, 0, 0);

    const booking = new Booking({
      customer: customerId,
      room: roomId,
      checkIn: checkInDate,
      stayDays: req.body.stayDays || 1,
      expectedCheckOut: expected,
      totalAmount,
      additionalServices: (additionalServices || []).map(s => ({ ...s, isPaid: true, status: 'Delivered' })),
      gstAmount,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: 'Paid',
      status: 'Active',
      alternatePhone,
      vehicleType,
      vehicleNumber,
      guestCount,
      additionalGuests,
      isKids,
      kidsAge,
      isPets,
      isKitchenAllowance,
      hasGst,
      gstRate,
      bookingType: req.body.bookingType,
      referrerName: req.body.referrerName,
      manualPrice: req.body.manualPrice
    });

    await booking.save();

    // Update Room Status
    room.status = 'Occupied';
    await room.save();

    res.json(booking);
  } catch (err) {
    console.error('Booking Operation Error:', err);
    res.status(500).json({ msg: `Check-in Failed: ${err.message}` });
  }
};

// @route   PUT api/bookings/:id/add-service
// @desc    Add extra services (Snacks, Water, etc.)
exports.addService = async (req, res) => {
  const { name, price } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    booking.additionalServices.push({ name, price, isPaid: false });
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error('Booking Operation Error:', err);
    res.status(500).json({ msg: `Check-in Error: ${err.message}` });
  }
};

// @route   PUT api/bookings/:id/check-out
// @desc    Calculate bill and complete booking
exports.checkOut = async (req, res) => {
  const { checkOutTime, paymentMethod, penaltyAmount, penaltyReason, isKeyReturned, isPropertyDamaged } = req.body;
  try {
    const booking = await Booking.findById(req.params.id).populate('room').populate('customer');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    const leaveTime = checkOutTime ? new Date(checkOutTime) : new Date();
    
    // Calculate pending services amount
    const unpaidServicesTotal = booking.additionalServices
      .filter(s => !s.isPaid)
      .reduce((sum, s) => sum + s.price, 0);
      
    // Add Penalty and Unpaid Services to the total amount
    const penalty = Number(penaltyAmount) || 0;
    const extraCharges = penalty + unpaidServicesTotal;
    
    // Add GST for extra charges (12%)
    const extraGst = extraCharges * 0.12;
    
    // Handle Final Settlement Amount from UI override or calculation
    const calculatedTotal = (booking.totalAmount || 0) + extraCharges + extraGst;
    booking.totalAmount = req.body.finalSettlementAmount ? Number(req.body.finalSettlementAmount) : calculatedTotal;
    booking.gstAmount = (booking.gstAmount || 0) + extraGst;
    
    // Mark all services as paid after checkout
    booking.additionalServices = booking.additionalServices.map(s => ({ ...s, isPaid: true }));
    
    booking.checkOut = leaveTime;
    booking.penaltyAmount = penalty;
    booking.penaltyReason = penaltyReason;
    booking.isKeyReturned = isKeyReturned;
    booking.isPropertyDamaged = isPropertyDamaged;
    booking.paymentMethod = paymentMethod || booking.paymentMethod;
    booking.paymentStatus = 'Paid';
    booking.status = 'Completed';

    await booking.save();

    // Sync Revenue
    await financialController.syncBookingRevenue(booking);

    // Update Room Status based on damage reports
    const room = await Room.findById(booking.room._id);
    room.status = isPropertyDamaged ? 'Maintenance' : 'Cleaning';
    await room.save();

    res.json(booking);
  } catch (err) {
    console.error('Booking Operation Error:', err);
    res.status(500).json({ msg: `Check-in Error: ${err.message}` });
  }
};

// @route   PUT api/bookings/:id/extend
// @desc    Extend stay by days
exports.extendStay = async (req, res) => {
  const { extraDays } = req.body;
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    const days = Number(extraDays) || 1;
    const roomPrice = booking.room?.price || 0;
    const extraAmount = days * roomPrice;
    const extraGst = extraAmount * 0.12;

    // Update Expected Checkout (add days to existing expected date)
    const currentExpected = new Date(booking.expectedCheckOut);
    currentExpected.setDate(currentExpected.getDate() + days);
    
    booking.expectedCheckOut = currentExpected;
    booking.stayDays = (booking.stayDays || 0) + days;
    booking.totalAmount = (booking.totalAmount || 0) + extraAmount + extraGst;
    booking.gstAmount = (booking.gstAmount || 0) + extraGst;

    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Booking Operation Failed: Server Connectivity Error' });
  }
};

// @route   GET api/bookings/active
// @desc    Get all active bookings
exports.getActiveBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'Active' })
      .populate('customer')
      .populate('room');
    res.json(bookings);
  } catch (err) {
    console.error('Booking Operation Error:', err);
    res.status(500).json({ msg: `Check-in Error: ${err.message}` });
  }
};

// @route   GET api/bookings/summary
// @desc    Get booking counts for Day, Month, Year
exports.getBookingSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [day, month, year] = await Promise.all([
      Booking.countDocuments({ checkIn: { $gte: startOfDay } }),
      Booking.countDocuments({ checkIn: { $gte: startOfMonth } }),
      Booking.countDocuments({ checkIn: { $gte: startOfYear } })
    ]);

    res.json({ day, month, year });
  } catch (err) {
    console.error('Booking Operation Error:', err);
    res.status(500).json({ msg: `Check-in Error: ${err.message}` });
  }
};

// @route   GET api/bookings/services/pending
// @desc    Get all pending service requests for room service
exports.getPendingServices = async (req, res) => {
  try {
    const activeBookings = await Booking.find({ 
      status: 'Active',
      'additionalServices.status': 'Pending' 
    }).populate('customer', 'name').populate('room', 'roomNumber');

    // Flatten and filter for only pending services with booking context
    const pendingTasks = [];
    activeBookings.forEach(booking => {
      booking.additionalServices.forEach(service => {
        if (service.status === 'Pending') {
          pendingTasks.push({
            bookingId: booking._id,
            serviceId: service._id,
            roomNumber: booking.room?.roomNumber,
            guestName: booking.customer?.name,
            serviceName: service.name,
            createdAt: service.createdAt || booking.updatedAt
          });
        }
      });
    });

    res.json(pendingTasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Booking Operation Failed: Server Connectivity Error' });
  }
};

// @route   PATCH api/bookings/:bookingId/services/:serviceId
// @desc    Update status of a specific service order
exports.updateServiceStatus = async (req, res) => {
  const { status } = req.body; // e.g., 'Delivered'
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.bookingId, "additionalServices._id": req.params.serviceId },
      { $set: { "additionalServices.$.status": status } },
      { new: true }
    );

    if (!booking) return res.status(404).json({ msg: 'Order not found' });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Booking Operation Failed: Server Connectivity Error' });
  }
};
