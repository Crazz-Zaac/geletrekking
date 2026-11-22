const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const { restrictToRoles } = require('../../middleware/roleMiddleware');
const Admin = require('../../models/user');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');

// GET/POST /addadmin — Deprecated: direct admin creation bypassed the secure invitation flow
// and generated unconfirmed 2FA secrets. All admin additions are managed via /api/admin/invites.
router.all('/addadmin', authMiddleware, restrictToRoles('superadmin'), (req, res) => {
  res.status(410).json({ message: 'Direct admin creation is deprecated. Please use the secure invitation flow at /api/admin/invites.' });
});

// DELETE /deleteadmin/:email — delete admin by email, prevent deleting self
router.delete('/deleteadmin/:email', authMiddleware, restrictToRoles('superadmin'), async (req, res) => {
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
