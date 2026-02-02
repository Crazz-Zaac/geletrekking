const mongoose = require("mongoose");

/**
 * ContactMessage Schema
 *
 * Stores messages submitted via the contact form. These records are
 * read-only via the API to prevent accidental deletion. An admin or
 * superadmin can view these messages from the dashboard.
 */
const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);