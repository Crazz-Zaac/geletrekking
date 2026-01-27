const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const restrictToRoles = require("../middleware/roleMiddleware");
const { submitMessage, getMessages } = require("../controllers/contactController");

// Public: submit a contact message
router.post("/", submitMessage);

// Admin: list contact messages
router.get(
  "/admin",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  getMessages
);

module.exports = router;