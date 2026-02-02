const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const restrictToRoles = require("../middleware/roleMiddleware");
const { getHero, updateHero } = require("../controllers/heroController");

// Public
router.get("/", getHero);

// Admin/Superadmin
router.put("/", authMiddleware, restrictToRoles("admin", "superadmin"), updateHero);

module.exports = router;
