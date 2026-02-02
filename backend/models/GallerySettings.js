const mongoose = require("mongoose");

const gallerySettingsSchema = new mongoose.Schema(
  {
    heroImageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GallerySettings", gallerySettingsSchema);