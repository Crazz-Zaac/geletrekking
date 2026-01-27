import { useEffect, useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { api } from "@/lib/apiClient";

async function uploadImage(file: File, folder: string) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await api.post(`/api/uploads/image?folder=${encodeURIComponent(folder)}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.url as string;
}

export default function AdminSettings() {
  const { data, isLoading, refetch } = useSiteSettings();
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
      await api.put("/api/settings", form);
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
      <h1 className="text-2xl font-extrabold">Site Settings</h1>
      <p className="text-sm text-slate-300 mt-1">
        Control global info like site name, logo, and contact details.
      </p>

      {msg && (
        <div className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm">
          {msg}
        </div>
      )}

      <div className="mt-6 space-y-5">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Site Name</label>
          <input
            value={form.siteName || ""}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Logo</label>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              {form.logoUrl ? (
                <img src={form.logoUrl} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                  none
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setMsg("Uploading...");
                try {
                  const url = await uploadImage(file, "logo");
                  setForm({ ...form, logoUrl: url });
                  setMsg("✅ Uploaded");
                } catch (err: any) {
                  setMsg(err?.response?.data?.message || err.message || "Upload failed");
                }
              }}
              className="block text-sm text-slate-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Phone</label>
            <input
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Address</label>
          <input
            value={form.address || ""}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["facebook", "instagram", "twitter", "linkedin"].map((k) => (
            <div key={k}>
              <label className="block text-sm text-slate-300 mb-1">
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </label>
              <input
                value={form.social?.[k] || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    social: { ...(form.social || {}), [k]: e.target.value },
                  })
                }
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
              />
            </div>
          ))}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-60 px-4 py-2 font-semibold"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
