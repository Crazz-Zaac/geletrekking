"use client";

import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { UserContext } from "../../context/UserContext";

// Admin testimonials management page
//
// Lists all testimonials and allows admin/superadmin users to
// approve/hide testimonials or delete them (superadmin only).  This
// leverages the `/api/testimonials/admin` endpoint for listing and
// updating testimonials.  Delete requests are restricted to
// superadmins per the backend route.
export default function AdminTestimonialsPage() {
  const { user, loading: userLoading } = useContext(UserContext);
  const router = useRouter();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Fields for creating a new testimonial
  const [newName, setNewName] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newMessage, setNewMessage] = useState("");
  const [creating, setCreating] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (!userLoading) {
      if (!user || !["admin", "superadmin"].includes(user.role)) {
        router.replace("/etalogin");
      }
    }
  }, [userLoading, user, router]);

  // Fetch testimonials
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/testimonials/admin`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTestimonials(res.data || []);
      } catch (err) {
        console.error(err);
        setMsg({ type: "error", text: err.response?.data?.message || "Failed to load testimonials" });
      } finally {
        setLoading(false);
      }
    };
    if (user && ["admin", "superadmin"].includes(user.role)) {
      fetchData();
    }
  }, [user]);

  // Create a new testimonial
  const createTestimonial = async (e) => {
    e.preventDefault();
    // validate fields
    if (!newName || !newMessage) {
      setMsg({ type: "error", text: "Name and message are required." });
      return;
    }
    try {
      setCreating(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/testimonials`,
        {
          name: newName,
          country: newCountry,
          rating: newRating,
          message: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh testimonials list after successful creation
      const resAdmin = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/testimonials/admin`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTestimonials(resAdmin.data || []);
      setMsg({ type: "success", text: "Testimonial added." });
      setNewName("");
      setNewCountry("");
      setNewRating(5);
      setNewMessage("");
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to create testimonial." });
    } finally {
      setCreating(false);
    }
  };

  const toggleApproval = async (t) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/testimonials/admin/${t._id}`,
        { isApproved: !t.isApproved },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTestimonials((prev) => prev.map((test) => (test._id === t._id ? res.data : test)));
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to update" });
    }
  };

  const deleteTestimonial = async (t) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/testimonials/admin/${t._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTestimonials((prev) => prev.filter((test) => test._id !== t._id));
      setMsg({ type: "success", text: "Deleted" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to delete" });
    }
  };

  return (
    <div className="min-h-screen bg-brand-light text-brand-secondary py-20 px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Manage Testimonials</h1>
      {msg && (
        <div
          className={`mb-4 p-3 rounded text-sm ${msg.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {msg.text}
        </div>
      )}

      {/* New Testimonial Form */}
      <div className="mb-8 max-w-xl">
        <h2 className="text-2xl font-semibold mb-3">Add New Testimonial</h2>
        <form onSubmit={createTestimonial} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rating</label>
            <select
              className="w-full border border-gray-300 rounded p-2"
              value={newRating}
              onChange={(e) => setNewRating(parseInt(e.target.value))}
            >
              {[5,4,3,2,1].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message *</label>
            <textarea
              className="w-full border border-gray-300 rounded p-2 h-28"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-brand-primary text-white px-4 py-2 rounded font-semibold hover:bg-brand-primary/90 transition"
          >
            {creating ? "Adding…" : "+ Add"}
          </button>
        </form>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : testimonials.length === 0 ? (
        <p>No testimonials found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Name</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Country</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Rating</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Message</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Approved</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t._id} className="border-t border-gray-200">
                  <td className="p-3 text-sm">{t.name}</td>
                  <td className="p-3 text-sm">{t.country || ""}</td>
                  <td className="p-3 text-sm">{t.rating || 5}</td>
                  <td className="p-3 text-sm">{t.message}</td>
                  <td className="p-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${t.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {t.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="p-3 text-sm flex gap-2">
                    <button
                      onClick={() => toggleApproval(t)}
                      className="px-2 py-1 text-xs rounded bg-brand-primary text-white hover:bg-brand-primary/90"
                    >
                      {t.isApproved ? "Hide" : "Approve"}
                    </button>
                    {user?.role === "superadmin" && (
                      <button
                        onClick={() => deleteTestimonial(t)}
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