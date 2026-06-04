const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { restrictToRoles } = require("../middleware/roleMiddleware");
const { auditContent } = require("../middleware/auditMiddleware");
const {
  getAllActivities,
  getAllActivitiesAdmin,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} = require("../controllers/activityController");

// ── Public ────────────────────────────────────────────────────
router.get("/", getAllActivities);
router.get("/:id", getActivityById);

// ── Admin only ────────────────────────────────────────────────
router.get("/admin/all", authMiddleware, restrictToRoles("admin", "superadmin"), getAllActivitiesAdmin);
router.post("/", authMiddleware, restrictToRoles("admin", "superadmin"), auditContent('activity', (req) => ({ targetLabel: req.body?.title })), createActivity);
router.put("/:id", authMiddleware, restrictToRoles("admin", "superadmin"), auditContent('activity', (req) => ({ targetId: req.params.id })), updateActivity);
router.delete("/:id", authMiddleware, restrictToRoles("admin", "superadmin"), auditContent('activity', (req) => ({ targetId: req.params.id })), deleteActivity);

module.exports = router;