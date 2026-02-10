import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Toaster } from "react-hot-toast";
import { showToast } from "@/lib/toast";

type Item = any;

export default function AdminTestimonials() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<any>({
    name: "",
    country: "",
    rating: 5,
    message: "",
    image: "",
    isApproved: true,
  });

  async function refresh() {
    setLoading(true);
    try {
      const res = await api.get("/api/testimonials/admin");
      console.log("📥 Fetched testimonials from server:", res.data);
      setItems(res.data || []);
    } catch (error: any) {
      showToast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function startCreate() {
    setEditing(null);
    setForm({ name: "", country: "", rating: 5, message: "", image: "", isApproved: true });
    console.log("🆕 Started creating new testimonial");
  }

  function startEdit(i: Item) {
    setEditing(i);
    const editForm = {
      name: i.name || "",
      country: i.country || "",
      rating: i.rating ?? 5,
      message: i.message || "",
      image: i.image || "",
      isApproved: !!i.isApproved,
    };
    console.log("✏️ Started editing testimonial:", editForm);
    setForm(editForm);
  }

  async function save() {
    // Prepare data - keep image as empty string if not provided, or use the actual value
    const dataToSend = {
      name: form.name.trim(),
      country: form.country.trim(),
      rating: Number(form.rating),
      message: form.message.trim(),
      image: form.image.trim() || null, // Send null if empty, otherwise send the URL
      isApproved: !!form.isApproved,
    };
    
    console.log("💾 Attempting to save with data:", dataToSend);
    
    try {
      if (editing?._id) {
        const res = await api.put(`/api/testimonials/admin/${editing._id}`, dataToSend);
        console.log("✅ Update response:", res.data);
        showToast.success("Testimonial updated successfully!");
      } else {
        const res = await api.post("/api/testimonials", dataToSend);
        console.log("✅ Create response:", res.data);
        showToast.success("Testimonial created successfully!");
      }
      await refresh();
      startCreate();
    } catch (e: any) {
      console.error("❌ Save error:", e);
      console.error("❌ Error response:", e?.response?.data);
      showToast.error(e?.response?.data?.message || e.message || "Failed to save testimonial");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    
    try {
      await api.delete(`/api/testimonials/admin/${id}`);
      showToast.success("Testimonial deleted successfully!");
      await refresh();
    } catch (e: any) {
      showToast.error(e?.response?.data?.message || e.message || "Failed to delete testimonial");
    }
  }

  // Helper to get display image
  function getImageUrl(item: Item) {
    console.log(`🖼️ Getting image for ${item.name}:`, item.image);
    if (item.image && item.image.trim()) {
      return item.image;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=3b82f6&color=fff&size=48&bold=true`;
  }

  return (
    <>
      {/* Toast Container */}
      <Toaster />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h1 className="text-2xl font-extrabold">Testimonials</h1>
          <p className="text-sm text-slate-300 mt-1">Manage customer testimonials.</p>

          <div className="mt-4 flex items-center gap-2">
            <button onClick={startCreate} className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm">
              + New
            </button>
            <button onClick={refresh} className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm">
              Refresh
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="text-slate-300">Loading...</div>
            ) : items.length > 0 ? (
              items.map((i) => (
                <div key={i._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={getImageUrl(i)}
                      alt={i.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/20 flex-shrink-0 bg-slate-700"
                      onError={(e) => {
                        console.error(`❌ Image failed for ${i.name}:`, i.image);
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(i.name)}&background=f59e0b&color=fff&size=48&bold=true`;
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold truncate">
                          {i.name} <span className="text-xs text-slate-400">({i.country || "—"})</span>
                        </div>
                        <div className="text-xs text-slate-400 whitespace-nowrap ml-2">
                          {i.rating}★ • {i.isApproved ? "Approved" : "Hidden"}
                        </div>
                      </div>
                      {i.image && (
                        <div className="text-xs text-green-400 mt-1 truncate">
                          📷 Has image: {i.image}
                        </div>
                      )}
                      {!i.image && (
                        <div className="text-xs text-slate-500 mt-1">
                          No image (using avatar)
                        </div>
                      )}
                      <div className="text-sm text-slate-200 mt-2 line-clamp-3">{i.message}</div>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => startEdit(i)}
                          className="text-xs rounded-lg bg-sky-500/15 text-sky-200 hover:bg-sky-500/25 px-2 py-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(i._id)}
                          className="text-xs rounded-lg bg-red-500/15 text-red-200 hover:bg-red-500/25 px-2 py-1"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-center py-8">
                No testimonials yet. Click "+ New" to create one.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sticky top-4">
          <h2 className="font-bold">{editing ? "Edit Testimonial" : "Create Testimonial"}</h2>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Country</label>
                <input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-white"
                  placeholder="USA"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Image URL (optional)</label>
              <input
                value={form.image}
                onChange={(e) => {
                  const newValue = e.target.value;
                  console.log("🖼️ Image URL changed to:", newValue);
                  setForm({ ...form, image: newValue });
                }}
                placeholder="https://i.pravatar.cc/150?img=12"
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-white text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">
                Leave empty for auto-generated avatar
              </p>
              
              {/* Preview */}
              <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-white/5">
                <p className="text-xs text-slate-400 mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <img
                    src={
                      form.image && form.image.trim()
                        ? form.image
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=3b82f6&color=fff&size=64&bold=true`
                    }
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                    onError={(e) => {
                      console.error("❌ Preview image failed:", form.image);
                    }}
                  />
                  <div className="text-xs text-slate-400 break-all flex-1">
                    {form.image ? `URL: ${form.image}` : "Auto-generated avatar"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Rating (1-5) *</label>
                <input
                  value={form.rating}
                  type="number"
                  min={1}
                  max={5}
                  onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })}
                  className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-white"
                />
              </div>
              <label className="flex items-center gap-2 text-sm mt-7">
                <input
                  type="checkbox"
                  checked={!!form.isApproved}
                  onChange={(e) => setForm({ ...form, isApproved: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-slate-300">Approved</span>
              </label>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={6}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-white"
                placeholder="Share your experience..."
              />
            </div>

            <button 
              onClick={save} 
              className="w-full rounded-lg bg-sky-500 hover:bg-sky-600 px-4 py-2 font-semibold transition-colors"
            >
              {editing ? "Update" : "Create"} Testimonial
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
