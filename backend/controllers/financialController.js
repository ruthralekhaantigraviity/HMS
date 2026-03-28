const Financial = require('../models/Financial');
const Booking = require('../models/Booking');

// @route   GET api/finance/summary
// @desc    Get financial overview (Super Admin)
exports.getSummary = async (req, res) => {
  try {
    const revenue = await Financial.aggregate([
      { $match: { type: 'Revenue' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const expenses = await Financial.aggregate([
      { $match: { type: 'Expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalRevenue = revenue[0]?.total || 0;
    const totalExpenses = expenses[0]?.total || 0;

    res.json({
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   POST api/finance/expense
// @desc    Add a new expense
exports.addExpense = async (req, res) => {
  const { category, amount, description } = req.body;
  try {
    const expense = new Financial({
      type: 'Expense',
      category,
      amount,
      description
    });
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Helper: Sync Booking Revenue (Call this after check-out)
exports.syncBookingRevenue = async (booking) => {
  try {
    const revenue = new Financial({
      type: 'Revenue',
      category: 'Booking',
      amount: booking.totalAmount - booking.gstAmount, // Base revenue
      description: `Booking #${booking._id} for Room ${booking.room}`
    });
    await revenue.save();
  } catch (err) {
    console.error('Financial Sync Error:', err);
  }
};
