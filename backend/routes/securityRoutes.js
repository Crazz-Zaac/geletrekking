const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/roleMiddleware");
const {
  getRiskHealth,
  getSslHealth,
} = require("../controllers/securityController");

const router = express.Router();

router.get(
  "/risk-health",
  authMiddleware,
  requirePermission('manage_security'),
  getRiskHealth
);

router.get(
  "/ssl-health",
  authMiddleware,
  requirePermission('manage_security'),
  getSslHealth
);

module.exports = router;
