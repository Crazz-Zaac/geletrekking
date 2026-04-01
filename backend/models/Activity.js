const mongoose = require("mongoose");

/**
 * Activity Schema
 *
 * Used to store company activities like treks, workshops,
 * events etc. Activities can be published/unpublished by admin.
 */
const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    category: {
      type: String,
      enum: ["Day Tour", "Adrenaline", "Wildlife", "Water Sports"],
      default: "Day Tour",
    },

    shortDescription: { type: String, required: true, trim: true },
    fullDescription: { type: String, default: "", trim: true },

    price: { type: Number, default: 0 },
    currency: { type: String, default: "USD", trim: true, uppercase: true },
    duration: { type: String, default: "", trim: true },
    maxAltitude: { type: String, default: "", trim: true },
    difficultyLevel: {
      type: String,
      enum: ["Easy", "Moderate", "Difficult", "Technical"],
      default: "Easy",
    },
    groupSizeMin: { type: Number, default: 1 },
    groupSizeMax: { type: Number, default: 1 },

    mainImage: { type: String, trim: true, default: null },
    galleryImages: [{ type: String, trim: true }],
    metaTitle: { type: String, default: "", trim: true },
    metaDescription: { type: String, default: "", trim: true },
    videoUrl: { type: String, default: "", trim: true },

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },

    itinerary: [
      {
        day: { type: Number, required: true, min: 1 },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "", trim: true },
      },
    ],
    includes: [{ type: String, trim: true }],
    excludes: [{ type: String, trim: true }],

    tags: [{ type: String, trim: true }],

    // Legacy compatibility fields
    description: { type: String, default: "", trim: true },
    date: { type: Date, default: Date.now },
    image: { type: String, trim: true, default: null },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

activitySchema.index({ isActive: 1, displayOrder: 1, createdAt: -1 });
activitySchema.index({ category: 1 });

module.exports = mongoose.model("Activity", activitySchema);