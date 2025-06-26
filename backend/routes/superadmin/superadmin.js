const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const Admin = require('../../models/Admin'); // Your Admin model

// GET form (optional)
router.get('/addadmin', authMiddleware, roleMiddleware('superadmin'), (req, res) => {
  res.json({ message: "Superadmin can access registration form" });
});

// POST to create a new admin
router.post('/addadmin', authMiddleware, roleMiddleware('superadmin'), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation (you can add more)
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Create new admin (hash password before saving ideally)
    const newAdmin = new Admin({
      username,
      email,
      password, // Ideally hash this before saving
      role: 'admin',
    });

    await newAdmin.save();

    res.status(201).json({ message: 'New admin created successfully', admin: newAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating admin' });
  }
});

module.exports = router;
