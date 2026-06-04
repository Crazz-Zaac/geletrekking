const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { normalizeRole } = require('../middleware/roleMiddleware');

// GET current logged-in user
router.get('/me', protect, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    const role = normalizeRole(req.user.role);
    res.json({ user: { ...req.user.toObject?.() ?? req.user, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
