"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { UserContext } from "../../../context/UserContext";

export default function NewBlogPostPage() {
  const { user, loading } = useContext(UserContext);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [author, setAuthor] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // Redirect if not admin
  if (!loading && (!user || !["admin", "superadmin"].includes(user.role))) {
    router.replace("/etalogin");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/blogs`,
        { title, excerpt, content, coverImage, author, isPublished },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Redirect to edit page or list
      router.push(`/admin/blogs/${res.data._id}`);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to create post" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light text-brand-secondary py-20 px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">New Blog Post</h1>
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
          <label htmlFor="publish" className="text-sm">Publish immediately</label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-primary text-white px-4 py-2 rounded font-semibold hover:bg-brand-primary/90 transition"
        >
          {saving ? "Creating…" : "Create Post"}
        </button>
      </form>
    </div>
  );
}