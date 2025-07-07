const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../../models/user'); // user model
const authController = require('../../controllers/authController'); // ✅ Import controller

// 🔐 Email + Password Login
router.post('/login', async (req, res) => {
  let { email, password } = req.body;

  if (typeof password === 'string') {
    password = password.trim();
    password = password.replace(/^"+|"+$/g, '');
  }

  try {
    const user = await Admin.findOne({ email, role: { $in: ['superadmin', 'admin'] } });

    if (!user) {
      return res.status(401).json({ message: 'User not found or unauthorized' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ✅ Google Login for Admins
router.post('/google-login', authController.googleLogin);

module.exports = router;
