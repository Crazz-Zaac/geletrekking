const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');

// GET current logged-in user
router.get('/me', protect, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    res.json({ user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
