const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { restrictToRoles } = require("../middleware/roleMiddleware");
const { auditContent } = require("../middleware/auditMiddleware");
const {
  renameGalleryCategory,
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getHeroImage,
  updateHeroImage,
} = require("../controllers/galleryController");

// ============== HERO IMAGE ROUTES ==============
// Public: get hero image
router.get("/hero", getHeroImage);

// Admin: update hero image
router.put(
  "/hero",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  auditContent('gallery.hero'),
  updateHeroImage
);

// Category route must precede the /:id item route.
router.put(
  "/categories/rename",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  auditContent('gallery.category', (req) => ({ targetLabel: req.body?.category })),
  renameGalleryCategory
);

// ============== GALLERY ITEMS ROUTES ==============
// Public: list gallery items (optionally filter by category or featured)
router.get("/", getGalleryItems);

// Admin: create a gallery item
router.post(
  "/",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  auditContent('gallery', (req) => ({ targetLabel: req.body?.title })),
  createGalleryItem
);

// Admin: update a gallery item
router.put(
  "/:id",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  auditContent('gallery', (req) => ({ targetId: req.params.id })),
  updateGalleryItem
);

// Content managers: delete a gallery item
router.delete(
  "/:id",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  auditContent('gallery', (req) => ({ targetId: req.params.id })),
  deleteGalleryItem
);

module.exports = router;