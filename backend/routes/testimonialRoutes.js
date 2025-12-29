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

// Admin: create a new testimonial
//
// Testimonials should only be created by authenticated admin or superadmin
// users.  The previous implementation allowed public users to submit
// testimonials, but based on current requirements (option 3.b) we
// restrict this route to admin and superadmin roles.
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

// Admin: update (approve/hide) a testimonial
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