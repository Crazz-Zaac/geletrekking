const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const restrictToRoles = require("../middleware/roleMiddleware");
const {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} = require("../controllers/galleryController");

// Public: list gallery items (optionally filter by category or featured)
router.get("/", getGalleryItems);

// Admin: create a gallery item
router.post(
  "/",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  createGalleryItem
);

// Admin: update a gallery item
router.put(
  "/:id",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  updateGalleryItem
);

// Superadmin: delete a gallery item
router.delete(
  "/:id",
  authMiddleware,
  restrictToRoles("superadmin"),
  deleteGalleryItem
);

module.exports = router;