const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const Admin = require('../../models/user');
const bcrypt = require('bcrypt');

// GET route — test if superadmin can access the admin creation form
router.get('/addadmin', authMiddleware, roleMiddleware('superadmin'), (req, res) => {
  res.json({ message: "Superadmin can access registration form" });
});

// POST — Create new admin (superadmin only)
router.post('/addadmin', authMiddleware, roleMiddleware('superadmin'), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields (name, email, password) are required' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await newAdmin.save();

    res.status(201).json({ message: 'New admin created successfully', admin: newAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating admin' });
  }
});

// DELETE /deleteadmin/:email — delete admin by email, prevent deleting self
router.delete('/deleteadmin/:email', authMiddleware, roleMiddleware('superadmin'), async (req, res) => {
  try {
    const email = req.params.email;

    if (req.user.email === email) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await Admin.deleteOne({ email });

    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting admin' });
  }
});

module.exports = router;
