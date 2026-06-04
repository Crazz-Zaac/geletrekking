const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { restrictToRoles } = require("../middleware/roleMiddleware");
const { auditContent } = require("../middleware/auditMiddleware");
const {
  createTrek,
  getTrekById,
  getAllTreks,
  updateTrek,
  deleteTrek,
  getAvailability,
  addAvailability,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/trekController");

// public routes, anyone can view treks and availability
router.get("/", getAllTreks);
router.get("/:id", getTrekById);
router.get("/:id/availability", getAvailability);

// only admin and superadmin can create, update or delete treks
router.post(
  "/",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  auditContent('trek', (req) => ({ targetId: req.body?.slug, targetLabel: req.body?.name })),
  createTrek
);
router.put(
  "/:id",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  auditContent('trek', (req) => ({ targetId: req.params.id })),
  updateTrek
);
router.delete(
  "/:id",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  auditContent('trek', (req) => ({ targetId: req.params.id })),
  deleteTrek
);

// only admin and superadmin can manage availability windows
router.post(
  "/:id/availability",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  auditContent('trek.availability', (req) => ({ targetId: req.params.id })),
  addAvailability
);
router.put(
  "/:id/availability/:availId",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  auditContent('trek.availability', (req) => ({ targetId: req.params.id, targetLabel: req.params.availId })),
  updateAvailability
);
router.delete(
  "/:id/availability/:availId",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  auditContent('trek.availability', (req) => ({ targetId: req.params.id, targetLabel: req.params.availId })),
  deleteAvailability
);

module.exports = router;