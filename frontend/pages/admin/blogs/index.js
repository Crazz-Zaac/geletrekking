"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { UserContext } from "../../../context/UserContext";

// Admin blog list and management
export default function AdminBlogListPage() {
  const { user, loading } = useContext(UserContext);
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [msg, setMsg] = useState(null);

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!user || !["admin", "superadmin"].includes(user.role))) {
      router.replace("/etalogin");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !["admin", "superadmin"].includes(user.role)) return;
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/blogs/admin`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPosts(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [user]);

  const deletePost = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/blogs/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prev) => prev.filter((p) => p._id !== id));
      setMsg({ type: "success", text: "Post deleted" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to delete" });
    }
  };

  const togglePublish = async (post) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/blogs/${post._id}`,
        { isPublished: !post.isPublished },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prev) => prev.map((p) => (p._id === post._id ? res.data : p)));
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to update" });
    }
  };

  return (
    <div className="min-h-screen bg-brand-light text-brand-secondary py-20 px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Manage Blog Posts</h1>
      {msg && (
        <div
          className={`mb-4 p-3 rounded text-sm ${msg.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {msg.text}
        </div>
      )}
      <div className="mb-6">
        <Link
          href="/admin/blogs/new"
          className="inline-block bg-brand-primary text-white px-4 py-2 rounded font-semibold hover:bg-brand-primary/90 transition"
        >
          + New Post
        </Link>
      </div>
      {loadingPosts ? (
        <p>Loading…</p>
      ) : posts.length === 0 ? (
        <p>No blog posts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Title</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Published</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Created</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id} className="border-t border-gray-200">
                  <td className="p-3 text-sm">
                    <Link href={`/admin/blogs/${post._id}`} className="text-brand-primary hover:underline">
                      {post.title}
                    </Link>
                  </td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${post.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="p-3 text-sm flex gap-2">
                    <button
                      onClick={() => togglePublish(post)}
                      className="px-2 py-1 text-xs rounded bg-brand-primary text-white hover:bg-brand-primary/90"
                    >
                      {post.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => deletePost(post._id)}
                      className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}