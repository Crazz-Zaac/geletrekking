"use client";

import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { UserContext } from "../../context/UserContext";

// Admin gallery management page
//
// Allows admins to view, create, update and delete gallery items.  Each
// item has a title, category, imageUrl and featured flag.  Create and
// update operations send requests to `/api/gallery`.  Delete
// operations are restricted to superadmin per backend route.
export default function AdminGalleryPage() {
  const { user, loading: userLoading } = useContext(UserContext);
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // New item fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [creating, setCreating] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (!userLoading) {
      if (!user || !["admin", "superadmin"].includes(user.role)) {
        router.replace("/etalogin");
      }
    }
  }, [userLoading, user, router]);

  // Fetch gallery items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/gallery`
        );
        setItems(res.data || []);
      } catch (err) {
        console.error(err);
        setMsg({ type: "error", text: err.response?.data?.message || "Failed to load gallery" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Create new item
  const createItem = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/gallery`,
        { title, category, imageUrl, isFeatured },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems((prev) => [...prev, res.data]);
      setTitle("");
      setCategory("");
      setImageUrl("");
      setIsFeatured(false);
      setMsg({ type: "success", text: "Created" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to create" });
    } finally {
      setCreating(false);
    }
  };

  // Toggle feature status
  const toggleFeature = async (item) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/gallery/${item._id}`,
        { isFeatured: !item.isFeatured },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems((prev) => prev.map((g) => (g._id === item._id ? res.data : g)));
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to update" });
    }
  };

  // Delete item (superadmin only)
  const deleteItem = async (item) => {
    if (!confirm("Delete this image?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/gallery/${item._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems((prev) => prev.filter((g) => g._id !== item._id));
      setMsg({ type: "success", text: "Deleted" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to delete" });
    }
  };

  return (
    <div className="min-h-screen bg-brand-light text-brand-secondary py-20 px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Manage Gallery</h1>
      {msg && (
        <div
          className={`mb-4 p-3 rounded text-sm ${msg.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {msg.text}
        </div>
      )}
      {/* New item form */}
      <div className="mb-8 max-w-xl">
        <h2 className="text-2xl font-semibold mb-3">Add New Image</h2>
        <form onSubmit={createItem} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="featured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <label htmlFor="featured" className="text-sm">Featured</label>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-brand-primary text-white px-4 py-2 rounded font-semibold hover:bg-brand-primary/90 transition"
          >
            {creating ? "Creating…" : "+ Add"}
          </button>
        </form>
      </div>

      {/* Existing gallery items */}
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p>No images found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Title</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Category</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Featured</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-t border-gray-200">
                  <td className="p-3 text-sm">{item.title}</td>
                  <td className="p-3 text-sm">{item.category}</td>
                  <td className="p-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${item.isFeatured ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {item.isFeatured ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="p-3 text-sm flex gap-2">
                    <button
                      onClick={() => toggleFeature(item)}
                      className="px-2 py-1 text-xs rounded bg-brand-primary text-white hover:bg-brand-primary/90"
                    >
                      {item.isFeatured ? "Unfeature" : "Feature"}
                    </button>
                    {user?.role === "superadmin" && (
                      <button
                        onClick={() => deleteItem(item)}
                        className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
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