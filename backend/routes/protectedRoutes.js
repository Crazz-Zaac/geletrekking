const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { restrictToRoles } = require('../middleware/roleMiddleware');

router.get('/admin-only', protect, restrictToRoles('admin', 'superadmin'), (req, res) => {
  res.json({ message: 'Hello Admin/Superadmin!' });
});

router.get('/superadmin-only', protect, restrictToRoles('superadmin'), (req, res) => {
  res.json({ message: 'Hello Superadmin!' });
});

module.exports = router;
