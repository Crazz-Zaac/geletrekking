const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission, restrictToRoles } = require("../middleware/roleMiddleware");
const { auditContent } = require("../middleware/auditMiddleware");
const {
  getSettings,
  updateSettings,
  updateActivitiesVisibility,
  getRegistrationsAffiliations,
  getRegistrationsAffiliationsAdmin,
  getRegistrationPreview,
  updateRegistrationDocument,
  addRegistrationDocument,
  deleteRegistrationDocument,
} = require("../controllers/settingsController");

// Public
router.get("/", getSettings);
router.get("/registrations-affiliations", getRegistrationsAffiliations);
router.get(
  "/registrations-affiliations/admin",
  authMiddleware,
  requirePermission('manage_settings'),
  getRegistrationsAffiliationsAdmin
);
router.get("/registrations-affiliations/:code/preview", getRegistrationPreview);

// Admin/Superadmin
router.put("/", authMiddleware, requirePermission('manage_settings'), updateSettings);
router.put(
  "/activities-visibility",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  auditContent("settings.activities_visibility", (req) => ({ targetLabel: String(req.body?.enabled) })),
  updateActivitiesVisibility
);

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

