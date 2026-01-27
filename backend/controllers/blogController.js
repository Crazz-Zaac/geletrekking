const BlogPost = require("../models/BlogPost");

// Helper to generate slugs from titles
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
    const post = await BlogPost.findOne({ slug: req.params.slug, isPublished: true });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new blog post (admin/superadmin)
exports.createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, author, isPublished } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }
    let slug = slugify(title);
    // Ensure unique slug by appending a suffix if needed
    let exists = await BlogPost.findOne({ slug });
    let suffix = 1;
    while (exists) {
      slug = `${slugify(title)}-${suffix++}`;
      exists = await BlogPost.findOne({ slug });
    }
    const post = await BlogPost.create({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      author,
      isPublished: !!isPublished,
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
    const updates = req.body;
    // If title changed, regenerate slug
    if (updates.title) {
      let newSlug = slugify(updates.title);
      let exists = await BlogPost.findOne({ slug: newSlug, _id: { $ne: id } });
      let suffix = 1;
      while (exists) {
        newSlug = `${slugify(updates.title)}-${suffix++}`;
        exists = await BlogPost.findOne({ slug: newSlug, _id: { $ne: id } });
      }
      updates.slug = newSlug;
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
    const post = await BlogPost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};