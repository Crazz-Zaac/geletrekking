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
} = require("../controllers/trekController");

// Routes

// Public
router.get("/", getAllTreks);
router.get("/:id", getTrekById);

// Admin/Superadmin only
router.post("/", authMiddleware, restrictToRoles("admin", "superadmin"), createTrek);
router.put("/:id", authMiddleware, restrictToRoles("admin", "superadmin"), updateTrek);
router.delete("/:id", authMiddleware, restrictToRoles("admin", "superadmin"), deleteTrek);

module.exports = router;
