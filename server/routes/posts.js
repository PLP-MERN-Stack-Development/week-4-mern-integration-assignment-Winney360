const express = require('express');
const router = express.Router();
const postControllers = require('../controllers/postControllers');
const auth = require('../middleware/auth');
const multer = require('multer'); // Import multer directly

const { upload, createPost, getPosts, getPostById, updatePost, deletePost } = postControllers;

// Create a post
router.post('/', auth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('POST /api/posts - Multer error:', err.message);
      return res.status(400).json({ success: false, error: `Multer error: ${err.message}` });
    } else if (err) {
      console.error('POST /api/posts - Unknown upload error:', err.message, err.stack);
      return res.status(500).json({ success: false, error: 'Server error during file upload' });
    }
    next();
  });
}, createPost);

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