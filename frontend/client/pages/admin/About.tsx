import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Plus, Trash2 } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { showToast } from "@/lib/toast";

async function uploadImage(file: File) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await api.post(`/api/uploads/image?folder=about`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.url as string;
}

interface Highlight {
  title: string;
  description: string;
}

interface Stat {
  label: string;
  value: string;
}

export default function AdminAbout() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({
    heroTitle: "",
    heroSubtitle: "",
    heroImageUrl: "",
    missionTitle: "",
    missionBody: "",
    storyTitle: "",
    storyBody: "",
  });
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/api/about");
      const d = res.data || {};
      setForm({
        heroTitle: d.heroTitle || "",
        heroSubtitle: d.heroSubtitle || "",
        heroImageUrl: d.heroImageUrl || "",
        missionTitle: d.missionTitle || "",
        missionBody: d.missionBody || "",
        storyTitle: d.storyTitle || "",
        storyBody: d.storyBody || "",
      });
      setHighlights(d.highlights || []);
      setStats(d.stats || []);
    } catch (error: any) {
      showToast.error("Failed to load about page data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    try {
      const payload = {
        heroTitle: form.heroTitle,
        heroSubtitle: form.heroSubtitle,
        heroImageUrl: form.heroImageUrl,
        missionTitle: form.missionTitle,
        missionBody: form.missionBody,
        storyTitle: form.storyTitle,
        storyBody: form.storyBody,
        highlights,
        stats,
      };
      
      await api.put("/api/about", payload);
      showToast.success("About page saved successfully!");
      await load();
    } catch (e: any) {
      showToast.error(e?.response?.data?.message || e.message || "Failed to save changes");
    }
  }

  const addHighlight = () => {
    setHighlights([...highlights, { title: "", description: "" }]);
    showToast.success("New highlight added");
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
    showToast.success("Highlight removed");
  };

  const updateHighlight = (index: number, field: keyof Highlight, value: string) => {
    const updated = [...highlights];
    updated[index][field] = value;
    setHighlights(updated);
  };

  const addStat = () => {
    setStats([...stats, { label: "", value: "" }]);
    showToast.success("New stat added");
  };

  const removeStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index));
    showToast.success("Stat removed");
  };

  const updateStat = (index: number, field: keyof Stat, value: string) => {
    const updated = [...stats];
    updated[index][field] = value;
    setStats(updated);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {/* Toast Container */}
      <Toaster />
      
      <div className="max-w-3xl">
        <h1 className="text-2xl font-extrabold">About Page</h1>
        <p className="text-sm text-slate-300 mt-1">
          Edit About page content
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Hero Title</label>
            <input
              value={form.heroTitle}
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Hero Subtitle</label>
            <textarea
              value={form.heroSubtitle}
              onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
              rows={3}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Hero Image</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const loadingToast = showToast.loading("Uploading image...");
                  try {
                    const url = await uploadImage(file);
                    setForm({ ...form, heroImageUrl: url });
                    showToast.success("Image uploaded successfully!");
                  } catch (err: any) {
                    showToast.error(err?.response?.data?.message || err.message || "Upload failed");
                  }
                }}
                className="block text-sm text-slate-300"
              />
              <input
                value={form.heroImageUrl}
                onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
                className="flex-1 rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-sm"
                placeholder="Or paste URL"
              />
            </div>
            {form.heroImageUrl ? (
              <div className="mt-3 rounded-2xl overflow-hidden border border-white/10">
                <img src={form.heroImageUrl} className="h-44 w-full object-cover" alt="Hero" />
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Mission Title</label>
              <input
                value={form.missionTitle}
                onChange={(e) => setForm({ ...form, missionTitle: e.target.value })}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Story Title</label>
              <input
                value={form.storyTitle}
                onChange={(e) => setForm({ ...form, storyTitle: e.target.value })}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Mission Body</label>
            <textarea
              value={form.missionBody}
              onChange={(e) => setForm({ ...form, missionBody: e.target.value })}
              rows={5}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Story Body</label>
            <textarea
              value={form.storyBody}
              onChange={(e) => setForm({ ...form, storyBody: e.target.value })}
              rows={5}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
            />
          </div>

          {/* Highlights Section */}
          <div className="border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm text-slate-300 font-semibold">Highlights</label>
              <button
                onClick={addHighlight}
                className="flex items-center gap-2 text-sm bg-sky-500 hover:bg-sky-600 px-3 py-1.5 rounded-lg"
              >
                <Plus size={16} />
                Add Highlight
              </button>
            </div>
            {highlights.length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-4">
                No highlights yet. Click "Add Highlight" to create one.
              </div>
            ) : (
              <div className="space-y-4">
                {highlights.map((highlight, index) => (
                  <div key={index} className="bg-slate-900/60 rounded-lg p-4 border border-white/5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-xs text-slate-400 font-semibold">Highlight #{index + 1}</span>
                      <button
                        onClick={() => removeHighlight(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        value={highlight.title}
                        onChange={(e) => updateHighlight(index, "title", e.target.value)}
                        placeholder="Title"
                        className="w-full rounded-lg bg-slate-800/60 border border-white/10 px-3 py-2 outline-none text-sm"
                      />
                      <textarea
                        value={highlight.description}
                        onChange={(e) => updateHighlight(index, "description", e.target.value)}
                        placeholder="Description"
                        rows={3}
                        className="w-full rounded-lg bg-slate-800/60 border border-white/10 px-3 py-2 outline-none text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm text-slate-300 font-semibold">Stats</label>
              <button
                onClick={addStat}
                className="flex items-center gap-2 text-sm bg-sky-500 hover:bg-sky-600 px-3 py-1.5 rounded-lg"
              >
                <Plus size={16} />
                Add Stat
              </button>
            </div>
            {stats.length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-4">
                No stats yet. Click "Add Stat" to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-slate-900/60 rounded-lg p-4 border border-white/5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-xs text-slate-400 font-semibold">Stat #{index + 1}</span>
                      <button
                        onClick={() => removeStat(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        value={stat.label}
                        onChange={(e) => updateStat(index, "label", e.target.value)}
                        placeholder="Label (e.g., Treks)"
                        className="w-full rounded-lg bg-slate-800/60 border border-white/10 px-3 py-2 outline-none text-sm"
                      />
                      <input
                        value={stat.value}
                        onChange={(e) => updateStat(index, "value", e.target.value)}
                        placeholder="Value (e.g., 120+)"
                        className="w-full rounded-lg bg-slate-800/60 border border-white/10 px-3 py-2 outline-none text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={save} 
            className="rounded-lg bg-sky-500 hover:bg-sky-600 px-4 py-2 font-semibold transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
