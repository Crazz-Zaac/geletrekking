const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const restrictToRoles = require("../middleware/roleMiddleware");
const {
  getApprovedTestimonials,
  createTestimonial,
  getAllTestimonials,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController");

// Public: get approved testimonials
router.get("/", getApprovedTestimonials);

// Admin/Superadmin: create a new testimonial
// Testimonials can only be created by authenticated admin or superadmin users.
// This approach is used when testimonials are curated rather than user-submitted.
router.post(
  "/",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  createTestimonial
);

// Admin: list all testimonials
router.get(
  "/admin",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  getAllTestimonials
);

// Admin: update/approve a testimonial
router.put(
  "/admin/:id",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  updateTestimonial
);

// Superadmin: delete a testimonial
router.delete(
  "/admin/:id",
  authMiddleware,
  restrictToRoles("superadmin"),
  deleteTestimonial
);

module.exports = router;