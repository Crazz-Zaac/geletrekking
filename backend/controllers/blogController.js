const mongoose = require("mongoose");
const BlogPost = require("../models/BlogPost");
const { isBot, isFirstViewToday } = require("../utils/blogViews");

// Helper to generate slugs from titles
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// A slug is taken if another post uses it now or used it before (its old links still redirect there).
async function uniqueSlug(title, excludeId) {
  const base = slugify(title) || "post";
  const notSelf = excludeId ? { _id: { $ne: excludeId } } : {};
  let slug = base;
  let suffix = 1;
  while (await BlogPost.exists({ ...notSelf, $or: [{ slug }, { previousSlugs: slug }] })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

// Is `slug` free for this post? Taken if another post uses it now or used it before.
async function slugAvailable(slug, excludeId) {
  const notSelf = excludeId ? { _id: { $ne: excludeId } } : {};
  return !(await BlogPost.exists({ ...notSelf, $or: [{ slug }, { previousSlugs: slug }] }));
}

// An admin-typed address, cleaned to the same form as generated ones. Returns "" if nothing usable is left.
function cleanSlug(value) {
  return typeof value === "string" ? slugify(value).slice(0, 120).replace(/-+$/, "") : "";
}

const TAKEN_MESSAGE = (slug) => `The web address "/blog/${slug}" is already used by another post. Choose a different one.`;

// Fields an admin may set directly. slug, previousSlugs, publishedAt, views and likes are managed here.
const EDITABLE_FIELDS = ["title", "excerpt", "content", "coverImage", "author", "hashtags", "isPublished"];

function normalizeHashtags(input) {
  const values = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? input.split(/[\s,]+/)
      : [];

  return Array.from(
    new Set(
      values
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .map((value) => value.replace(/^#+/, ''))
        .filter(Boolean)
        .map((value) => `#${value.toLowerCase()}`)
    )
  );
}

// Get all published blog posts (public)
exports.getAllBlogs = async (req, res) => {
  try {
    const posts = await BlogPost.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get blog post by slug (public)
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    // An old address returns the post too; the site then redirects to post.slug.
    const post =
      (await BlogPost.findOne({ slug, isPublished: true })) ||
      (await BlogPost.findOne({ previousSlugs: slug, isPublished: true }));
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const counts = (post) => ({ views: post.views || 0, likes: post.likes || 0 });
// Reader activity isn't an edit, so it must not change the post's "last updated" date.
const countUpdate = { new: true, timestamps: false, projection: "views likes" };

// Count a read (public)
exports.recordBlogView = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await BlogPost.findOne({ slug, isPublished: true }).select("views likes").lean();
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userAgent = String(req.get("user-agent") || "");
    if (isBot(userAgent) || !isFirstViewToday({ ip: req.ip, userAgent, slug })) return res.json(counts(post));

    const updated = await BlogPost.findOneAndUpdate({ slug, isPublished: true }, { $inc: { views: 1 } }, countUpdate).lean();
    res.json(counts(updated || post));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Like or unlike a post (public)
exports.setBlogLike = async (req, res) => {
  try {
    const { slug } = req.params;
    if (typeof req.body?.liked !== "boolean") return res.status(400).json({ message: "Liked must be true or false." });

    const filter = req.body.liked ? { slug, isPublished: true } : { slug, isPublished: true, likes: { $gt: 0 } };
    const updated = await BlogPost.findOneAndUpdate(filter, { $inc: { likes: req.body.liked ? 1 : -1 } }, countUpdate).lean();
    if (updated) return res.json(counts(updated));

    const post = await BlogPost.findOne({ slug, isPublished: true }).select("views likes").lean();
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(counts(post));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new blog post (admin/superadmin)
exports.createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, author, hashtags, isPublished } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }
    const requested = cleanSlug(req.body.slug);
    if (requested && !(await slugAvailable(requested))) {
      return res.status(409).json({ message: TAKEN_MESSAGE(requested) });
    }
    const slug = requested || (await uniqueSlug(title));
    const post = await BlogPost.create({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      author,
      hashtags: normalizeHashtags(hashtags),
      isPublished: !!isPublished,
      publishedAt: isPublished ? new Date() : undefined,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update a blog post (admin/superadmin)
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid blog post ID" });
    }
    const body = req.body || {};
    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) updates[field] = body[field];
    }
    if (Object.prototype.hasOwnProperty.call(updates, "hashtags")) {
      updates.hashtags = normalizeHashtags(updates.hashtags);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "isPublished")) {
      updates.isPublished = !!updates.isPublished;
    }

    const current = await BlogPost.findById(id).select("title slug isPublished publishedAt previousSlugs").lean();
    if (!current) return res.status(404).json({ message: "Post not found" });

    // Posts live before publishedAt existed have none; treat them as published already.
    const hasBeenPublished = !!current.publishedAt || current.isPublished;
    if (updates.isPublished && !current.publishedAt) updates.publishedAt = new Date();

    let newSlug = null;
    const requested = Object.prototype.hasOwnProperty.call(body, "slug") ? cleanSlug(body.slug) : "";
    if (requested && requested !== current.slug) {
      // Explicitly edited address: allowed at any time; the old one keeps redirecting.
      if (!(await slugAvailable(requested, id))) {
        return res.status(409).json({ message: TAKEN_MESSAGE(requested) });
      }
      newSlug = requested;
    } else if (!hasBeenPublished && updates.title && updates.title.trim() !== current.title) {
      // Never-live draft: the address follows the title, unless the admin set a custom one.
      const base = slugify(current.title || "");
      const followsTitle = current.slug === base || new RegExp(`^${base}-\\d+$`).test(current.slug);
      if (followsTitle) newSlug = await uniqueSlug(updates.title, id);
    }

    if (newSlug && newSlug !== current.slug) {
      updates.slug = newSlug;
      // Moving back to an earlier address takes it out of the history.
      const history = (current.previousSlugs || []).filter((s) => s && s !== newSlug);
      if (current.slug && !history.includes(current.slug)) history.push(current.slug);
      updates.previousSlugs = history;
    }

    const updated = await BlogPost.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Post not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a blog post (superadmin)
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid blog post ID" });
    }
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get a blog post by ID (admin/superadmin)
//
// This endpoint returns a post regardless of its published state.  It
// should be protected by authentication and role middleware.
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid blog post ID" });
    }
    const post = await BlogPost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};