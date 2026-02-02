const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const restrictToRoles = require("../middleware/roleMiddleware");
const {
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
} = require("../controllers/blogController");

// Public: list all published posts
router.get("/", getAllBlogs);

// Admin: list all posts (published or not)
router.get(
  "/admin",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  async (req, res) => {
    try {
      const posts = await require("../models/BlogPost").find().sort({ createdAt: -1 });
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Admin: get a post by id
router.get(
  "/admin/:id",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  getBlogById
);

// Public: get a published post by slug
router.get("/:slug", getBlogBySlug);

// Admin: create a new post
router.post(
  "/",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  createBlog
);

// Admin: update a post by id
router.put(
  "/:id",
  authMiddleware,
  restrictToRoles("admin", "superadmin"),
  updateBlog
);

// Superadmin: delete a post by id
router.delete(
  "/:id",
  authMiddleware,
  restrictToRoles("superadmin"),
  deleteBlog
);

module.exports = router;