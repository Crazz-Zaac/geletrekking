const GalleryItem = require("../models/GalleryItem");
const GallerySettings = require("../models/GallerySettings");
const mongoose = require("mongoose");

// Allowed fields for gallery item creates/updates (prevents mass-assignment).
const ALLOWED_ITEM_FIELDS = new Set(["title", "imageUrl", "category", "isFeatured"]);

// Strip anything that is not a plain string (guards against NoSQL operator objects
// smuggled through query parameters, e.g. ?category[$gt]=).
const toSafeString = (value) => (typeof value === "string" ? value.trim() : undefined);

// Get all gallery items (public). Accepts optional query params: category, featured=true
exports.getGalleryItems = async (req, res) => {
  try {
    const filter = {};
    // toSafeString rejects objects/arrays, preventing NoSQL operator injection.
    const category = toSafeString(req.query.category);
    if (category) filter.category = category;
    if (req.query.featured === "true") filter.isFeatured = true;
    const items = await GalleryItem.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a gallery item (admin)
exports.createGalleryItem = async (req, res) => {
  try {
    const { title, imageUrl, category, isFeatured } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "Image URL is required" });
    // Only the allowed fields are written — prevents mass-assignment.
    const item = await GalleryItem.create({ title, imageUrl, category, isFeatured });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update a gallery item (admin)
exports.updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid gallery item ID" });
    }
    // Whitelist the fields that are allowed to be updated — prevents mass-assignment
    // and blocks any Mongoose operator keys that slipped through sanitization.
    const rawUpdates = req.body;
    const updates = {};
    for (const key of ALLOWED_ITEM_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(rawUpdates, key)) {
        updates[key] = rawUpdates[key];
      }
    }
    const updated = await GalleryItem.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Item not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a gallery item (content manager)
exports.deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid gallery item ID" });
    }
    const item = await GalleryItem.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Gallery item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ============== HERO IMAGE FUNCTIONS ==============

// Get hero image (public)
exports.getHeroImage = async (req, res) => {
  try {
    // Find or create settings document
    let settings = await GallerySettings.findOne();
    
    if (!settings) {
      settings = await GallerySettings.create({ heroImageUrl: "" });
    }
    
    res.json({ heroImageUrl: settings.heroImageUrl });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update hero image (admin)
exports.updateHeroImage = async (req, res) => {
  try {
    const { heroImageUrl } = req.body;
    
    // Find existing settings or create new one
    let settings = await GallerySettings.findOne();
    
    if (settings) {
      settings.heroImageUrl = heroImageUrl;
      await settings.save();
    } else {
      settings = await GallerySettings.create({ heroImageUrl });
    }
    
    res.json({ heroImageUrl: settings.heroImageUrl });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// Rename a filter category across every gallery item using it.
exports.renameGalleryCategory = async (req, res) => {
  const { category, newCategory } = req.body;
  if (typeof category !== "string" || typeof newCategory !== "string" || !category.trim() || !newCategory.trim()) {
    return res.status(400).json({ message: "Current and new category names are required" });
  }
  const name = newCategory.trim();
  try {
    if (!(await GalleryItem.exists({ category }))) {
      return res.status(404).json({ message: "Category no longer exists. Refresh the gallery." });
    }
    if (category !== name && await GalleryItem.exists({ category: name })) {
      return res.status(409).json({ message: "A category with that name already exists. Choose another name." });
    }
    const result = await GalleryItem.updateMany({ category }, { $set: { category: name } }, { runValidators: true });
    res.json({ category: name, updatedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to rename gallery category" });
  }
};
