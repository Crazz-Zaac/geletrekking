const mongoose = require("mongoose");

/**
 * BlogPost Schema
 *
 * Represents a blog article on the site. Each post has a human‑readable
 * slug for SEO, an optional excerpt for previews and a cover image
 * URL which is expected to be a Cloudinary URL (but any public URL
 * works for now). Timestamps are enabled to automatically maintain
 * `createdAt` and `updatedAt` fields. Posts are unpublished by
 * default and must be explicitly published by an admin or
 * superadmin.
 */
const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, trim: true },
    author: { type: String, trim: true },
    hashtags: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlogPost", blogPostSchema);