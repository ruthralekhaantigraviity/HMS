const Payout = require('../models/Payout');
const User = require('../models/User');

// @route   GET api/payouts
// @desc    Get all payout history
exports.getPayoutHistory = async (req, res) => {
  try {
    const history = await Payout.find().populate('user', 'name role').sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   POST api/payouts/release
// @desc    Release salary for a staff member
exports.releaseSalary = async (req, res) => {
  const { userId, amount, month } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const payout = new Payout({
      user: userId,
      amount: amount || user.salary,
      month,
      status: 'Paid',
      paymentDate: Date.now()
    });

    await payout.save();
    res.json(payout);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
