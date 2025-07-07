const jwt = require('jsonwebtoken');
const config = process.env;

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Auth middleware - Raw Token:', req.header('Authorization')); // Log full header
  console.log('Auth middleware - Extracted Token:', token); // Log extracted token
  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log('Auth middleware - Decoded Payload:', decoded); // Log decoded payload
    if (!decoded || !decoded.id) {
      throw new Error('Invalid token payload: Missing id');
    }
    req.user = { id: decoded.id }; // Match the { id: user._id } structure
    console.log('Auth middleware - Set User:', req.user); // Log set user
    next();
  } catch (err) {
    console.error('Auth middleware - Verification Error:', err.message, err.stack); // Full stack trace
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

module.exports = auth;