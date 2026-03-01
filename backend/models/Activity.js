const mongoose = require("mongoose");

/**
 * Activity Schema
 *
 * Used to store company activities like treks, workshops,
 * events etc. Activities can be published/unpublished by admin.
 */
const activitySchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date:        { type: Date, required: true },
    image:       { type: String, trim: true, default: null },
    tags:        [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);