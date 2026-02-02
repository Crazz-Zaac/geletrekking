import { useEffect, useState } from "react";
import { useHero } from "@/hooks/useHero";
import { api } from "@/lib/apiClient";

async function uploadImage(file: File) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await api.post(`/api/uploads/image?folder=hero`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.url as string;
}

export default function AdminHero() {
  const { data, isLoading, refetch } = useHero();
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await api.put("/api/hero", form);
      setMsg("✅ Saved");
      refetch();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold">Hero Section</h1>
      <p className="text-sm text-slate-300 mt-1">
        Control homepage hero title, subtitle, background and CTA.
      </p>

      {msg && (
        <div className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm">
          {msg}
        </div>
      )}

      <div className="mt-6 space-y-5">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Title</label>
          <input
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Subtitle</label>
          <textarea
            value={form.subtitle || ""}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            rows={4}
            className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Background Image</label>
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div
              className="h-44 bg-cover bg-center"
              style={{
                backgroundImage: `${form.overlay || ""} , url("${form.backgroundImage || ""}")`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setMsg("Uploading...");
                try {
                  const url = await uploadImage(file);
                  setForm({ ...form, backgroundImage: url });
                  setMsg("✅ Uploaded");
                } catch (err: any) {
                  setMsg(err?.response?.data?.message || err.message || "Upload failed");
                }
              }}
              className="block text-sm text-slate-300"
            />

            <input
              value={form.backgroundImage || ""}
              onChange={(e) => setForm({ ...form, backgroundImage: e.target.value })}
              placeholder="Or paste image URL"
              className="flex-1 rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Overlay CSS</label>
          <input
            value={form.overlay || ""}
            onChange={(e) => setForm({ ...form, overlay: e.target.value })}
            className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">CTA Text</label>
            <input
              value={form.ctaText || ""}
              onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">CTA Link</label>
            <input
              value={form.ctaLink || ""}
              onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            />
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-60 px-4 py-2 font-semibold"
        >
          {saving ? "Saving..." : "Save Hero"}
        </button>
      </div>
    </div>
  );
}
