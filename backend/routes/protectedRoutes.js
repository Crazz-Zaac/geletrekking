const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.get('/admin-only', protect, checkRole('admin', 'superadmin'), (req, res) => {
  res.json({ message: 'Hello Admin/Superadmin!' });
});

router.get('/superadmin-only', protect, checkRole('superadmin'), (req, res) => {
  res.json({ message: 'Hello Superadmin!' });
});

module.exports = router;
