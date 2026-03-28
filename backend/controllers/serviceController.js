const Service = require('../models/Service');

// @route   GET api/services
// @desc    Get all active services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   POST api/services
// @desc    Add a new service
exports.addService = async (req, res) => {
  const { name, price, category, icon, status } = req.body;
  try {
    let service = new Service({ name, price, category, icon, status });
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/services/:id
// @desc    Update a service
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(service);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/services/:id
// @desc    Remove a service
exports.deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Service deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
