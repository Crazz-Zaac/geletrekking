const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { restrictToRoles } = require("../middleware/roleMiddleware");
const { auditContent } = require("../middleware/auditMiddleware");
const { getFaqPage, updateFaqPage } = require("../controllers/faqController");

router.get("/", getFaqPage);

router.put("/", protect, restrictToRoles("admin", "superadmin"), auditContent('faq', () => 'faq-page'), updateFaqPage);

module.exports = router;