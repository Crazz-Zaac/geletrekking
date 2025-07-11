const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../../models/user'); // Replace with correct model if needed
const authController = require('../../controllers/authController'); // Google login controller

// 🔐 Manual Email + Password Login
router.post('/login', async (req, res) => {
  let { email, password, role: expectedRole } = req.body;

  // Trim quotes if password is a string
  if (typeof password === 'string') {
    password = password.trim();
    password = password.replace(/^"+|"+$/g, '');
  }

  try {
    // Find user with either admin or superadmin role
    const user = await Admin.findOne({ email, role: { $in: ['superadmin', 'admin'] } });

    if (!user) {
      return res.status(401).json({ message: 'User not found or unauthorized' });
    }

    // ✅ Check if user's role matches the expected role from frontend
    if (user.role !== expectedRole) {
      return res.status(403).json({
        message: `You are not authorized to login as ${expectedRole}. Your role is ${user.role}.`,
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ✅ Google Login Route
router.post('/google-login', authController.googleLogin);

module.exports = router;
