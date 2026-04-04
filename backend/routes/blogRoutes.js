const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single blog post
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
