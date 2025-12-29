"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { UserContext } from "../../../context/UserContext";

// Admin blog edit page
//
// This page allows administrators to edit an existing blog post.  It
// fetches the post by its ID on mount and pre-populates the form.
// Only users with role `admin` or `superadmin` can access it.  On
// submission the updated post is sent to the API.  Published state
// can be toggled via checkbox.
export default function EditBlogPostPage() {
  const { user, loading: userLoading } = useContext(UserContext);
  const router = useRouter();
  const { id } = router.query;

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [author, setAuthor] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);
  const [slug, setSlug] = useState("");
  const [loadingPost, setLoadingPost] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // Redirect non-admin users
  useEffect(() => {
    if (!userLoading) {
      if (!user || !["admin", "superadmin"].includes(user.role)) {
        router.replace("/etalogin");
      }
    }
  }, [userLoading, user, router]);

  // Fetch existing post
  useEffect(() => {
    if (!id || !user || !["admin", "superadmin"].includes(user.role)) return;
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/blogs/admin/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const post = res.data;
        setTitle(post.title || "");
        setExcerpt(post.excerpt || "");
        setContent(post.content || "");
        setCoverImage(post.coverImage || "");
        setAuthor(post.author || "");
        setIsPublished(!!post.isPublished);
        setCreatedAt(post.createdAt);
        setSlug(post.slug || "");
      } catch (err) {
        console.error(err);
        setMsg({ type: "error", text: err.response?.data?.message || "Failed to load post" });
      } finally {
        setLoadingPost(false);
      }
    };
    fetchPost();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/blogs/${id}`,
        { title, excerpt, content, coverImage, author, isPublished },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg({ type: "success", text: "Post updated" });
      // Optionally update slug and createdAt if changed
      setSlug(res.data.slug || slug);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to update post" });
    } finally {
      setSaving(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="min-h-screen bg-brand-light text-brand-secondary py-20 px-4">
        <p>Loading post…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light text-brand-secondary py-20 px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Edit Blog Post</h1>
      {msg && (
        <div
          className={`mb-4 p-3 rounded text-sm ${msg.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {msg.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <textarea
            className="w-full border border-gray-300 rounded p-2 h-20"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content *</label>
          <textarea
            className="w-full border border-gray-300 rounded p-2 h-40"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cover Image URL</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Author</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="publish"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <label htmlFor="publish" className="text-sm">Published</label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-primary text-white px-4 py-2 rounded font-semibold hover:bg-brand-primary/90 transition"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {createdAt && (
          <p className="text-xs text-gray-500 mt-2">
            Created: {new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            {slug ? ` • Slug: ${slug}` : ""}
          </p>
        )}
      </form>
    </div>
  );
}