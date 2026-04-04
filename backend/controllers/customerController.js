const Customer = require('../models/Customer');

// @route   POST api/customers
// @desc    Add or get customer
exports.enrollCustomer = async (req, res) => {
  const { name, phone, email, identityType, identityNumber, identityImage, location } = req.body;
  try {
    if (!name || !phone) {
      return res.status(400).json({ msg: 'Incomplete Profile: Name and Phone are mandatory' });
    }

    let customer = await Customer.findOne({ 
      $or: [{ phone }, { identityNumber: identityNumber || 'NON_EXISTENT_ID' }] 
    });

    let alreadyExists = false;
    if (customer) {
      alreadyExists = true;
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
    console.error('Customer Enrollment Error:', err);
    res.status(500).json({ msg: `Database Error: ${err.message}` });
  }
};

// @route   GET api/customers
// @desc    Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    console.error('Customer Fetch Error:', err);
    res.status(500).json({ msg: 'Failed to retrieve customer records' });
  }
};

// @route   GET api/bookings/customers/search?phone=XYZ
// @desc    Find existing customer by phone
exports.searchByPhone = async (req, res) => {
  const { phone } = req.query;
  try {
    if (!phone) return res.status(400).json({ msg: 'Phone number required for search' });
    const customer = await Customer.findOne({ phone });
    if (!customer) return res.status(404).json({ msg: 'No existing record found for this number' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ msg: 'Network Error: Customer lookup failed' });
  }
};
