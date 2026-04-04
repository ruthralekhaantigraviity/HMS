const express = require('express');
const router = express.Router();
const Query = require('../models/Query');

// Submit a new query (Public)
router.post('/submit', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const newQuery = new Query({ name, email, subject, message });
    await newQuery.save();
    res.status(201).json({ message: 'Query submitted successfully. We will get back to you soon!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all queries (Admin only - simplification for now)
router.get('/', async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update query status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const query = await Query.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(query);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
