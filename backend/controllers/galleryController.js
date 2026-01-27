const GalleryItem = require("../models/GalleryItem");
const GallerySettings = require("../models/GallerySettings");

// Get all gallery items (public). Accepts optional query params: category, featured=true
exports.getGalleryItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
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
    const updates = req.body;
    const updated = await GalleryItem.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Item not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a gallery item (superadmin)
exports.deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
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