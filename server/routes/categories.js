
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// Create a category
router.post(
  '/',
  auth,
  [check('name').notEmpty().withMessage('Category name is required')],
  async (req, res) => {
    console.log('POST /api/categories - Request body:', req.body); // Debug log
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('POST /api/categories - Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name } = req.body;
      const category = new Category({ name });
      await category.save();
      console.log('Category created:', category);
      res.status(201).json(category);
    } catch (err) {
      console.error('POST /api/categories - Error:', err.message);
      res.status(500).json({ error: 'Server error during category creation' });
    }
  }
);

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error('GET /api/categories - Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;