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
router.post("/", authMiddleware, restrictToRoles("admin", "superadmin"), createTrek);
router.put("/:id", authMiddleware, restrictToRoles("admin", "superadmin"), updateTrek);
router.delete("/:id", authMiddleware, restrictToRoles("admin", "superadmin"), deleteTrek);

// only admin and superadmin can manage availability windows
router.post("/:id/availability", authMiddleware, restrictToRoles("admin", "superadmin"), addAvailability);
router.put("/:id/availability/:availId", authMiddleware, restrictToRoles("admin", "superadmin"), updateAvailability);
router.delete("/:id/availability/:availId", authMiddleware, restrictToRoles("admin", "superadmin"), deleteAvailability);

module.exports = router;