const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const restrictToRoles = require("../middleware/roleMiddleware");
const {
  createTrek,
  getTrekById,
  getAllTreks,
  updateTrek,
  deleteTrek,
  // availability
  getAvailability,
  addAvailability,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/trekController");

// ── Trek Routes ────────────────────────────────────────────────

// Public
router.get("/", getAllTreks);
router.get("/:id", getTrekById);

// Admin/Superadmin only
router.post(  "/",    authMiddleware, restrictToRoles("admin", "superadmin"), createTrek);
router.put(   "/:id", authMiddleware, restrictToRoles("admin", "superadmin"), updateTrek);
router.delete("/:id", authMiddleware, restrictToRoles("admin", "superadmin"), deleteTrek);

// ── Availability Routes (all admin/superadmin only) ────────────
// GET    /api/treks/:id/availability          → list all ranges
// POST   /api/treks/:id/availability          → add a new range
// PUT    /api/treks/:id/availability/:availId → update a range
// DELETE /api/treks/:id/availability/:availId → delete a range

router.get(
  "/:id/availability",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  getAvailability
);

router.post(
  "/:id/availability",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  addAvailability
);

router.put(
  "/:id/availability/:availId",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  updateAvailability
);

router.delete(
  "/:id/availability/:availId",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  deleteAvailability
);

module.exports = router;
