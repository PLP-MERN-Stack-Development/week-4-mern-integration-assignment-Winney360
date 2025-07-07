
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../routes/auth');
const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Create a post
router.post('/', auth, upload.single('image'), async (req, res) => {
  console.log('POST /api/posts - Request body:', req.body); // Debug log
  console.log('POST /api/posts - File:', req.file); // Debug log
  console.log('POST /api/posts - User:', req.user); // Debug log
  try {
    const { title, content, categoryId } = req.body;
    if (!title || !content || !categoryId) {
      console.log('POST /api/posts - Missing required fields:', { title, content, categoryId });
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const post = new Post({
      title,
      content,
      category: categoryId,
      featuredImage: req.file ? req.file.filename : 'default-post.jpg',
      author: req.user.id,
    });

    await post.save();
    console.log('Post created:', post); // Debug log
    res.status(201).json(post);
  } catch (err) {
    console.error('POST /api/posts - Error:', err.message); // Debug log
    res.status(500).json({ error: 'Server error during post creation' });
  }
});

// Update a post
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, content, categoryId } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = categoryId || post.category;
    if (req.file) {
      post.featuredImage = req.file.filename;
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error('PUT /api/posts/:id - Error:', err.message);
    res.status(500).json({ error: 'Server error during post update' });
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await post.remove();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('DELETE /api/posts/:id - Error:', err.message);
    res.status(500).json({ error: 'Server error during post deletion' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('category', 'name')
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('GET /api/posts - Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('category', 'name')
      .populate('author', 'username');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error('GET /api/posts/:id - Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;