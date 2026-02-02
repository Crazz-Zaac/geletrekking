const mongoose = require("mongoose");

/**
 * GalleryItem Schema
 *
 * Represents an image in the public gallery. The `imageUrl` should
 * point to a publicly accessible image (e.g. Cloudinary URL). Items
 * can be marked as featured to appear more prominently on the
 * homepage. Categories allow grouping of images by trek or region.
 */
const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GalleryItem", galleryItemSchema);