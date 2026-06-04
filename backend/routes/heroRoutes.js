const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { restrictToRoles } = require("../middleware/roleMiddleware");
const { auditContent } = require("../middleware/auditMiddleware");
const { getHero, updateHero } = require("../controllers/heroController");

// Public
router.get("/", getHero);

// Admin/Superadmin
router.put("/", authMiddleware, restrictToRoles("admin", "superadmin"), auditContent('hero'), updateHero);

module.exports = router;
