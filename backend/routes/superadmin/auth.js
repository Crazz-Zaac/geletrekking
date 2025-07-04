const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');  // Using bcrypt, not bcryptjs
const Admin = require('../../models/user'); // Assuming superadmins and admins are in same model

router.post('/login', async (req, res) => {
  let { email, password } = req.body;

  // Log raw password from client
  console.log('Raw password:', JSON.stringify(password));

  if (typeof password === 'string') {
    password = password.trim();
    console.log('Trimmed password:', JSON.stringify(password));

    // Force remove ALL wrapping double quotes (could be multiple)
    password = password.replace(/^"+|"+$/g, '');
    console.log('Password after forced quote removal:', JSON.stringify(password));
  }

  try {
    // Only allow login if role is 'superadmin'
    const superadmin = await Admin.findOne({ email, role: 'superadmin' });

    if (!superadmin) {
      return res.status(401).json({ message: 'Superadmin not found or unauthorized' });
    }

    const isMatch = await bcrypt.compare(password, superadmin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password for superadmin' });
    }

    const token = jwt.sign({ id: superadmin._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      username: superadmin.username,
      email: superadmin.email,
      role: superadmin.role,
    });
  } catch (err) {
    console.error('Superadmin login error:', err.message);
    res.status(500).json({ message: 'Server error during superadmin login' });
  }
});

module.exports = router;
