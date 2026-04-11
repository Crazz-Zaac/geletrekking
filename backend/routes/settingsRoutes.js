const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const restrictToRoles = require("../middleware/roleMiddleware");
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
router.put("/", authMiddleware, restrictToRoles("admin", "superadmin"), updateSettings);

// Registrations & Affiliations Management
router.post(
  "/registrations-affiliations",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  addRegistrationDocument
);
router.put(
  "/registrations-affiliations/:code",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  updateRegistrationDocument
);
router.delete(
  "/registrations-affiliations/:code",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  deleteRegistrationDocument
);

module.exports = router;

