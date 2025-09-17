const express = require("express");
const router = express.Router();
const { 
  getTrekById, 
  getAllTreks, 
  createTrek, 
  updateTrek, 
  deleteTrek 
} = require("../controllers/trekController");

const  protect  = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware"); // must export function directly

// --------------------
// PUBLIC ROUTES
// --------------------
router.get("/", getAllTreks);
router.get("/:id", getTrekById);

// --------------------
// ADMIN ROUTES
// --------------------
router.post("/", protect, checkRole("admin", "superadmin"), (req, res) => res.send("POST route works"));

router.put("/:id", protect, checkRole("admin", "superadmin"), updateTrek);
router.delete("/:id", protect, checkRole("admin", "superadmin"), deleteTrek);

module.exports = router;
