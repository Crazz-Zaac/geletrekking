const express = require("express");
const router  = express.Router();

const authMiddleware  = require("../middleware/authMiddleware");
const restrictToRoles = require("../middleware/roleMiddleware");

const {
  submitMessage,
  getMessages,
  markAsRead,
  markAsUnread,
  deleteMessage,
} = require("../controllers/contactController");

/* ─────────────────────────────────────────────
   PUBLIC
───────────────────────────────────────────── */
// POST /api/contact          – submit a contact message
router.post("/", submitMessage);

/* ─────────────────────────────────────────────
   ADMIN / SUPERADMIN  (auth + role guard on every route)
───────────────────────────────────────────── */
// GET  /api/contact/admin              – list all messages (oldest first)
router.get(
  "/admin",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  getMessages
);

// PATCH /api/contact/admin/:id/read    – mark one message as read
router.patch(
  "/admin/:id/read",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  markAsRead
);

// PATCH /api/contact/admin/:id/unread  – mark one message as unread
router.patch(
  "/admin/:id/unread",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  markAsUnread
);

// DELETE /api/contact/admin/:id        – permanently delete a message
router.delete(
  "/admin/:id",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  deleteMessage
);

module.exports = router;