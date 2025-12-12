// backend/routes/aboutRoutes.js
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const restrictToRoles = require("../middleware/roleMiddleware");
const {
  getAboutPage,
  updateAboutPage,
} = require("../controllers/aboutController");

// Public: anyone can view About page content
router.get("/", getAboutPage);

// Protected: only admin & superadmin can update
router.put(
  "/",
  protect,
  restrictToRoles("admin", "superadmin"),
  updateAboutPage
);

module.exports = router;
