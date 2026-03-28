const Inventory = require('../models/Inventory');

// @route   GET api/inventory
// @desc    Get all inventory items
exports.getItems = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
};

// @route   POST api/inventory
// @desc    Add a new inventory item
exports.addItem = async (req, res) => {
  const { name, category, stock, minStock, unit } = req.body;
  try {
    const item = new Inventory({ name, category, stock, minStock, unit });
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
};

// @route   PUT api/inventory/:id
// @desc    Update an inventory item (stock or details)
exports.updateItem = async (req, res) => {
  try {
    let item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    // Update individual fields
    item = await Inventory.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    
    // Force pre-save middleware to update status if stock changed
    await item.save(); 
    
    res.json(item);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/inventory/:id
// @desc    Delete an inventory item
exports.deleteItem = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
};
