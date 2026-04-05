const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const restrictToRoles = require("../middleware/roleMiddleware");
const { getFaqPage, updateFaqPage } = require("../controllers/faqController");

router.get("/", getFaqPage);

router.put("/", protect, restrictToRoles("admin", "superadmin"), updateFaqPage);

module.exports = router;