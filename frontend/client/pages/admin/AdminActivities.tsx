import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Toaster } from "react-hot-toast";
import { showToast } from "@/lib/toast";

type Activity = any;

export default function AdminActivities() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    date: "",
    image: "",
    tags: "",
    isPublished: true,
  });

  async function refresh() {
    setLoading(true);
    try {
      const res = await api.get("/api/activities/admin/all");
      setItems(res.data || []);
    } catch {
      showToast.error("Failed to load activities");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  function startCreate() {
    setEditing(null);
    setForm({ title: "", description: "", date: "", image: "", tags: "", isPublished: true });
  }

  function startEdit(item: Activity) {
    setEditing(item);
    setForm({
      title:       item.title || "",
      description: item.description || "",
      date:        item.date ? new Date(item.date).toISOString().split("T")[0] : "",
      image:       item.image || "",
      tags:        item.tags ? item.tags.join(", ") : "",
      isPublished: !!item.isPublished,
    });
  }

  async function save() {
    if (!form.title.trim())       return showToast.error("Title is required");
    if (!form.description.trim()) return showToast.error("Description is required");
    if (!form.date)               return showToast.error("Date is required");

    const payload = {
      title:       form.title.trim(),
      description: form.description.trim(),
      date:        form.date,
      image:       form.image.trim() || null,
      tags:        form.tags
        ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [],
      isPublished: !!form.isPublished,
    };

    try {
      if (editing?._id) {
        await api.put(`/api/activities/${editing._id}`, payload);
        showToast.success("Activity updated!");
      } else {
        await api.post("/api/activities", payload);
        showToast.success("Activity created!");
      }
      await refresh();
      startCreate();
    } catch (e: any) {
      showToast.error(e?.response?.data?.message || "Failed to save activity");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this activity?")) return;
    try {
      await api.delete(`/api/activities/${id}`);
      showToast.success("Activity deleted!");
      await refresh();
    } catch (e: any) {
      showToast.error(e?.response?.data?.message || "Failed to delete");
    }
  }

  return (
    <>
      <Toaster />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── List ── */}
        <div>
          <h1 className="text-2xl font-extrabold">Activities</h1>
          <p className="text-sm text-slate-300 mt-1">Manage company activities and events.</p>

          <div className="mt-4 flex gap-2">
            <button onClick={startCreate} className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm">+ New</button>
            <button onClick={refresh}     className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm">Refresh</button>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-slate-300">Loading...</div>
            ) : items.length > 0 ? (
              items.map((item) => (
                <div key={item._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                        🏔️
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold truncate">{item.title}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ml-2 whitespace-nowrap ${
                          item.isPublished
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}>
                          {item.isPublished ? "Published" : "Hidden"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      <p className="text-sm text-slate-300 mt-1 line-clamp-2">{item.description}</p>
                      {item.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="text-xs rounded-lg bg-sky-500/15 text-sky-200 hover:bg-sky-500/25 px-2 py-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(item._id)}
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
                No activities yet. Click "+ New" to create one.
              </div>
            )}
          </div>
        </div>

        {/* ── Form ── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sticky top-4">
          <h2 className="font-bold">{editing ? "Edit Activity" : "Create Activity"}</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-white"
                placeholder="Mountain Wellness Retreat"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-white"
                placeholder="Describe the activity..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-white"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={!!form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-300">Published</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Image URL</label>
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Tags (comma separated)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-white"
                placeholder="Wellness, Yoga, Meditation"
              />
            </div>

            <button
              onClick={save}
              className="w-full rounded-lg bg-sky-500 hover:bg-sky-600 px-4 py-2 font-semibold transition-colors"
            >
              {editing ? "Update" : "Create"} Activity
            </button>

            {editing && (
              <button
                onClick={startCreate}
                className="w-full rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2 text-sm transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

      </div>
    </>
  );
}