const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/roleMiddleware");
const {
  getSettings,
  updateSettings,
  getRegistrationsAffiliations,
  updateRegistrationDocument,
  addRegistrationDocument,
  deleteRegistrationDocument,
} = require("../controllers/settingsController");

// Public
router.get("/", getSettings);
router.get("/registrations-affiliations", getRegistrationsAffiliations);

// Admin/Superadmin
router.put("/", authMiddleware, requirePermission('manage_settings'), updateSettings);

// Registrations & Affiliations Management
router.post(
  "/registrations-affiliations",
  authMiddleware,
  requirePermission('manage_settings'),
  addRegistrationDocument
);
router.put(
  "/registrations-affiliations/:code",
  authMiddleware,
  requirePermission('manage_settings'),
  updateRegistrationDocument
);
router.delete(
  "/registrations-affiliations/:code",
  authMiddleware,
  requirePermission('manage_settings'),
  deleteRegistrationDocument
);

module.exports = router;

