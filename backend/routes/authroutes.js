const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { normalizeRole } = require('../middleware/roleMiddleware');

// GET current logged-in user
router.get('/me', protect, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    const role = normalizeRole(req.user.role);
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name || req.user.username,
        email: req.user.email,
        role,
        twoFactorEnabled: !!req.user.twoFactorEnabled,
        requiresTwoFactorSetup: role === 'superadmin' && !req.user.twoFactorEnabled,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
