const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ✅ Middleware
const authMiddleware = require("../../middleware/authMiddleware");
const restrictToRoles = require("../../middleware/roleMiddleware");


/* -----------------------------
 ✅ ADMIN LOGIN
  POST /api/admin/login
--------------------------------*/
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({ email });

    if (!admin || !["admin", "superadmin"].includes(admin.role)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "✅ Login successful",
      token,
      role: admin.role,
      user: { email: admin.email, role: admin.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------
 ✅ GET ALL ADMINS (SUPERADMIN)
  GET /api/admin/admins
--------------------------------*/
router.get(
  "/admins",
  authMiddleware,
  restrictToRoles("superadmin"),
  async (req, res) => {
    try {
      const admins = await User.find({ role: { $in: ["admin", "superadmin"] } })
        .select("_id email role createdAt");

      res.json(admins);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* -----------------------------
 ✅ CREATE ADMIN (SUPERADMIN)
  POST /api/admin/admins
--------------------------------*/
router.post(
  "/admins",
  authMiddleware,
  restrictToRoles("superadmin"),
  async (req, res) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password)
        return res.status(400).json({ message: "Email & password required" });

      const exists = await User.findOne({ email });
      if (exists)
        return res.status(400).json({ message: "User already exists" });

      const hashed = await bcrypt.hash(password, 10);

      await User.create({
        email,
        password: hashed,
        role: role || "admin",
      });

      res.json({ message: "✅ Admin created successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* -----------------------------
 ✅ DELETE ADMIN (SUPERADMIN)
  DELETE /api/admin/admins/:id
--------------------------------*/
router.delete(
  "/admins/:id",
  authMiddleware,
  restrictToRoles("superadmin"),
  async (req, res) => {
    try {
      const admin = await User.findById(req.params.id);
      if (!admin) return res.status(404).json({ message: "Admin not found" });

      if (admin.role === "superadmin") {
        return res.status(403).json({ message: "❌ Cannot delete a superadmin" });
      }

      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "✅ Admin deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
