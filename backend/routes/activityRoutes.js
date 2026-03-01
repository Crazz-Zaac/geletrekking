const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const restrictToRoles = require("../middleware/roleMiddleware");
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
router.post("/", authMiddleware, restrictToRoles("admin", "superadmin"), createActivity);
router.put("/:id", authMiddleware, restrictToRoles("admin", "superadmin"), updateActivity);
router.delete("/:id", authMiddleware, restrictToRoles("admin", "superadmin"), deleteActivity);

module.exports = router;