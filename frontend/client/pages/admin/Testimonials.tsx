import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

type Item = any;

export default function AdminTestimonials() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    name: "",
    country: "",
    rating: 5,
    message: "",
    isApproved: true,
  });

  async function refresh() {
    setLoading(true);
    try {
      const res = await api.get("/api/testimonials/admin");
      setItems(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function startCreate() {
    setEditing(null);
    setForm({ name: "", country: "", rating: 5, message: "", isApproved: true });
  }

  function startEdit(i: Item) {
    setEditing(i);
    setForm({
      name: i.name || "",
      country: i.country || "",
      rating: i.rating ?? 5,
      message: i.message || "",
      isApproved: !!i.isApproved,
    });
  }

  async function save() {
    setMsg(null);
    try {
      if (editing?._id) {
        await api.put(`/api/testimonials/admin/${editing._id}`, form);
        setMsg("✅ Updated");
      } else {
        await api.post("/api/testimonials", form);
        setMsg("✅ Created");
      }
      await refresh();
      startCreate();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || e.message || "Save failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    setMsg(null);
    try {
      await api.delete(`/api/testimonials/admin/${id}`);
      setMsg("🗑️ Deleted");
      await refresh();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || e.message || "Delete failed");
    }
  }

  return (
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

        {msg && <div className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm">{msg}</div>}

        <div className="mt-4 space-y-2">
          {loading ? (
            <div className="text-slate-300">Loading...</div>
          ) : (
            items.map((i) => (
              <div key={i._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{i.name} <span className="text-xs text-slate-400">({i.country || "—"})</span></div>
                  <div className="text-xs text-slate-400">{i.rating}★ • {i.isApproved ? "Approved" : "Hidden"}</div>
                </div>
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
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-bold">{editing ? "Edit Testimonial" : "Create Testimonial"}</h2>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Rating (1-5)</label>
              <input
                value={form.rating}
                type="number"
                min={1}
                max={5}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
              />
            </div>
            <label className="flex items-center gap-2 text-sm mt-7">
              <input
                type="checkbox"
                checked={!!form.isApproved}
                onChange={(e) => setForm({ ...form, isApproved: e.target.checked })}
              />
              Approved
            </label>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={6}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            />
          </div>

          <button onClick={save} className="rounded-lg bg-sky-500 hover:bg-sky-600 px-4 py-2 font-semibold">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
