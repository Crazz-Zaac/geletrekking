const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const restrictToRoles = require("../middleware/roleMiddleware");
const { getSettings, updateSettings } = require("../controllers/settingsController");

// Public
router.get("/", getSettings);

// Admin/Superadmin
router.put("/", authMiddleware, restrictToRoles("admin", "superadmin"), updateSettings);

module.exports = router;
