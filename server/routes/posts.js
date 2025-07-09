const express = require('express');
const router = express.Router();
const postControllers = require('../controllers/postControllers');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = require('../middleware/upload');

const { createPost, getPosts, getPostById, updatePost, deletePost } = postControllers;

// Create a new post
router.post('/', auth, upload.single('featuredImage'), async (req, res) => {
  try {
    const { title, content, categoryId } = req.body;
    if (!title || !content || !categoryId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Handle file upload
    const featuredImage = req.file
      ? req.file.path.replace(/\\/g, '/') // Convert Windows path to Unix-style for consistency
      : 'default-post.jpg';

    const post = new Post({
      title,
      content,
      category: categoryId,
      featuredImage,
      author: req.user._id,
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
router.get('/', getPosts);

// Get a single post
router.get('/:id', getPostById);

// Update a post
router.put('/:id', auth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('PUT /api/posts/:id - Multer error:', err.message);
      return res.status(400).json({ success: false, error: `Multer error: ${err.message}` });
    } else if (err) {
      console.error('PUT /api/posts/:id - Unknown upload error:', err.message, err.stack);
      return res.status(500).json({ success: false, error: 'Server error during file upload' });
    }
    next();
  });
}, updatePost);

// Delete a post
router.delete('/:id', auth, deletePost);

module.exports = router;