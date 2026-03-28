const Customer = require('../models/Customer');

// @route   POST api/customers
// @desc    Add or get customer
exports.enrollCustomer = async (req, res) => {
  const { name, phone, email, identityType, identityNumber, identityImage, location } = req.body;
  try {
    let customer = await Customer.findOne({ 
      $or: [{ phone }, { identityNumber }] 
    });

    let alreadyExists = false;
    if (customer) {
      alreadyExists = true;
      // If customer exists, update their details with the latest info
      customer.name = name || customer.name;
      customer.phone = phone || customer.phone;
      customer.email = email || customer.email;
      customer.identityType = identityType || customer.identityType;
      customer.identityNumber = identityNumber || customer.identityNumber;
      if (identityImage) customer.identityImage = identityImage;
      customer.location = location || customer.location;
      await customer.save();
      return res.json({ ...customer._doc, alreadyExists });
    }

    customer = new Customer({ 
      name, phone, email, 
      identityType, identityNumber, identityImage, location 
    });
    await customer.save();
    res.json(customer);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   GET api/customers
// @desc    Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   GET api/bookings/customers/search?phone=XYZ
// @desc    Find existing customer by phone
exports.searchByPhone = async (req, res) => {
  const { phone } = req.query;
  try {
    const customer = await Customer.findOne({ phone });
    if (!customer) return res.status(404).json({ msg: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
