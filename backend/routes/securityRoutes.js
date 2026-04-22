const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const restrictToRoles = require("../middleware/roleMiddleware");
const {
  getRiskHealth,
  getSslHealth,
} = require("../controllers/securityController");

const router = express.Router();

router.get(
  "/risk-health",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  getRiskHealth
);

router.get(
  "/ssl-health",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  getSslHealth
);

module.exports = router;
