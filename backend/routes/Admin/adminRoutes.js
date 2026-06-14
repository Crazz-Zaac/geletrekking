const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const {
  login,
  beginTwoFactorSetup,
  verifyTwoFactorSetup,
  disableTwoFactor,
} = require("../../controllers/authController");
const {
  createInvite,
  listInvites,
  revokeInvite,
  acceptInvite,
  updateUserStatus,
  listAuditLogs,
} = require("../../controllers/adminUserController");

// ✅ Middleware
const authMiddleware = require("../../middleware/authMiddleware");
const { restrictToRoles, requirePermission } = require("../../middleware/roleMiddleware");
const { authLoginLimiter } = require("../../middleware/rateLimitMiddleware");


/* -----------------------------
 ✅ ADMIN LOGIN
  POST /api/admin/login
--------------------------------*/
router.post("/login", authLoginLimiter, login);

router.post(
  "/2fa/setup",
  authMiddleware,
  restrictToRoles("editor", "superadmin"),
  beginTwoFactorSetup
);

router.post(
  "/2fa/verify",
  authMiddleware,
  restrictToRoles("editor", "superadmin"),
  verifyTwoFactorSetup
);

router.post(
  "/2fa/disable",
  authMiddleware,
  restrictToRoles("editor", "superadmin"),
  disableTwoFactor
);

/* -----------------------------
 ✅ GET ALL ADMINS (SUPERADMIN)
  GET /api/admin/admins
--------------------------------*/
router.get(
  "/admins",
  authMiddleware,
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const admins = await User.find({ role: { $in: ["editor", "superadmin", "admin"] } })
        .select("_id email role status createdAt");

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
// Admin creation is handled via invite flow.

/* -----------------------------
 ✅ DELETE ADMIN (SUPERADMIN)
  DELETE /api/admin/admins/:id
--------------------------------*/
router.delete(
  "/admins/:id",
  authMiddleware,
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const admin = await User.findById(req.params.id);
      if (!admin) return res.status(404).json({ message: "Admin not found" });

      if (admin.role === "superadmin") {
        return res.status(403).json({ message: "❌ Cannot delete a superadmin" });
      }

      admin.status = 'disabled';
      await admin.save();
      res.json({ message: "✅ Admin disabled successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post(
  '/invites',
  authMiddleware,
  requirePermission('manage_users'),
  createInvite
);

router.get(
  '/invites',
  authMiddleware,
  requirePermission('manage_users'),
  listInvites
);

router.delete(
  '/invites/:id',
  authMiddleware,
  requirePermission('manage_users'),
  revokeInvite
);

router.post('/invites/accept', acceptInvite);

router.patch(
  '/users/:id/status',
  authMiddleware,
  requirePermission('manage_users'),
  updateUserStatus
);

router.get(
  '/audit-logs',
  authMiddleware,
  requirePermission('manage_users'),
  listAuditLogs
);

module.exports = router;
