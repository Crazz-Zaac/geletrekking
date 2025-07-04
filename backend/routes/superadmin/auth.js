const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');  // Using bcrypt, not bcryptjs
const Admin = require('../../models/user'); // Both superadmins and admins in same model

router.post('/login', async (req, res) => {
  let { email, password } = req.body;

  if (typeof password === 'string') {
    password = password.trim();
    password = password.replace(/^"+|"+$/g, '');
  }

  try {
    // Find user with role 'superadmin' or 'admin'
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

    // Send back user info including role
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

module.exports = router;
