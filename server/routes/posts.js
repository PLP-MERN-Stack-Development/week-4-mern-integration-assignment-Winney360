const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // Updated multer middleware
const multer = require('multer');
const mongoose = require('mongoose');

// Create a new post
router.post('/', auth, upload.single('featuredImage'), async (req, res) => {
  try {
    const { title, content, categoryId } = req.body;
    if (!title || !content || !categoryId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const featuredImage = req.file
      ? req.file.path.replace(/\\/g, '/') // Convert Windows path to Unix-style
      : 'default-post.jpg';

    const post = new Post({
      title,
      content,
      category: categoryId,
      featuredImage,
      author: new mongoose.Types.ObjectId(req.user.id),
      slug: title.toLowerCase().replace(/ /g, '-'),
    });

    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Error creating post:', error);
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: `Multer error: ${error.message}` });
    } else if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get all posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().populate('category').populate('author', 'username email');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get post by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('category').populate('author', 'username email');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update post
router.put('/:id', auth, upload.single('featuredImage'), async (req, res) => {
  try {
    const { title, content, categoryId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author.toString() !== req.user._id) return res.status(403).json({ error: 'Not authorized' });

    // Update fields
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = categoryId || post.category;
    if (req.file) {
      post.featuredImage = req.file.path.replace(/\\/g, '/'); // Update image if provided
    }

    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Error updating post:', error);
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: `Multer error: ${error.message}` });
    } else if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author.toString() !== req.user._id) return res.status(403).json({ error: 'Not authorized' });

    await post.remove();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;