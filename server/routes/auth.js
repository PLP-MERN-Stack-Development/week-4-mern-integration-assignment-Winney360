const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const config = process.env;

// User registration
router.post(
  '/register',
  [
    check('username').notEmpty().withMessage('Username is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Registration validation errors:', errors.array()); // Debug log
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password } = req.body;

      // Check for existing user by email or username
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        console.log('Registration failed: User already exists', { email, username }); // Debug log
        return res.status(400).json({ error: 'User with this email or username already exists' });
      }

      const user = new User({ username, email, password });
      await user.save();
      console.log('User registered:', { _id: user._id, username, email }); // Debug log

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(201).json({
        token,
        user: { _id: user._id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error('Registration error:', err.message); // Debug log
      res.status(500).json({ error: 'Server error during registration' });
    }
  }
);

// User login
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Login validation errors:', errors.array()); // Debug log
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        console.log('Login failed: User not found', { email }); // Debug log
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log('Login failed: Invalid password', { email }); // Debug log
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('User logged in:', { _id: user._id, username: user.username, email }); // Debug log
      res.json({
        token,
        user: { _id: user._id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error('Login error:', err.message); // Debug log
      res.status(500).json({ error: 'Server error during login' });
    }
  }
);

module.exports = router;