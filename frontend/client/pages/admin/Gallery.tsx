import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Toaster } from "react-hot-toast";
import { showToast } from "@/lib/toast";

type Item = any;

async function uploadImage(file: File, folder: string = "gallery") {
  const fd = new FormData();
  fd.append("image", file);
  const res = await api.post(`/api/uploads/image?folder=${folder}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.url as string;
}

export default function AdminGallery() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<any>({
    title: "",
    imageUrl: "",
    category: "",
    isFeatured: false,
  });
  
  // Hero image state
  const [heroImage, setHeroImage] = useState("");
  const [heroLoading, setHeroLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await api.get("/api/gallery");
      setItems(res.data || []);
    } catch (error: any) {
      showToast.error("Failed to load gallery items");
    } finally {
      setLoading(false);
    }
  }

  async function loadHeroImage() {
    try {
      const res = await api.get("/api/gallery/hero");
      setHeroImage(res.data?.heroImageUrl || "");
    } catch (e) {
      console.error("Failed to load hero image", e);
    }
  }

  async function saveHeroImage() {
    setHeroLoading(true);
    try {
      await api.put("/api/gallery/hero", { heroImageUrl: heroImage });
      showToast.success("Hero image updated successfully!");
    } catch (e: any) {
      showToast.error(e?.response?.data?.message || e.message || "Failed to update hero image");
    } finally {
      setHeroLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    loadHeroImage();
  }, []);

  function startCreate() {
    setEditing(null);
    setForm({ title: "", imageUrl: "", category: "", isFeatured: false });
  }

  function startEdit(i: Item) {
    setEditing(i);
    setForm({
      title: i.title || "",
      imageUrl: i.imageUrl || "",
      category: i.category || "",
      isFeatured: !!i.isFeatured,
    });
  }

  async function save() {
    try {
      if (editing?._id) {
        await api.put(`/api/gallery/${editing._id}`, form);
        showToast.success("Gallery item updated successfully!");
      } else {
        await api.post("/api/gallery", form);
        showToast.success("Gallery item created successfully!");
      }
      await refresh();
      startCreate();
    } catch (e: any) {
      showToast.error(e?.response?.data?.message || e.message || "Failed to save gallery item");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this image?")) return;
    
    try {
      await api.delete(`/api/gallery/${id}`);
      showToast.success("Gallery item deleted successfully!");
      await refresh();
    } catch (e: any) {
      showToast.error(e?.response?.data?.message || e.message || "Failed to delete gallery item");
    }
  }

  return (
    <>
      {/* Toast Container */}
      <Toaster />

      <div className="space-y-6">
        {/* Hero Image Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-bold mb-4">Gallery Hero Image</h2>
          <p className="text-sm text-slate-300 mb-4">
            This image appears at the top of the gallery page behind the title.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Hero Image</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const loadingToast = showToast.loading("Uploading hero image...");
                    try {
                      const url = await uploadImage(file, "gallery-hero");
                      setHeroImage(url);
                      showToast.success("Hero image uploaded successfully!");
                    } catch (err: any) {
                      showToast.error(err?.response?.data?.message || err.message || "Upload failed");
                    }
                  }}
                  className="block text-sm text-slate-300"
                />
                <input
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  className="flex-1 rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-sm"
                  placeholder="Or paste URL"
                />
              </div>
              
              {heroImage && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-white/10">
                  <img src={heroImage} className="h-48 w-full object-cover" alt="Hero preview" />
                </div>
              )}
            </div>
            
            <button
              onClick={saveHeroImage}
              disabled={heroLoading}
              className="rounded-lg bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 px-4 py-2 font-semibold transition-colors"
            >
              {heroLoading ? "Saving..." : "Save Hero Image"}
            </button>
          </div>
        </div>

        {/* Gallery Items Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h1 className="text-2xl font-extrabold">Gallery Items</h1>
            <p className="text-sm text-slate-300 mt-1">Manage gallery images.</p>

            <div className="mt-4 flex items-center gap-2">
              <button onClick={startCreate} className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm">
                + New Image
              </button>
              <button onClick={refresh} className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm">
                Refresh
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {loading ? (
                <div className="text-slate-300">Loading...</div>
              ) : (
                items.map((i) => (
                  <div key={i._id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <div className="h-32 bg-slate-900/30">
                      <img src={i.imageUrl} className="h-full w-full object-cover" alt={i.title} />
                    </div>
                    <div className="p-3">
                      <div className="font-semibold text-sm">{i.title || "Untitled"}</div>
                      <div className="text-xs text-slate-400">{i.category || "—"} • {i.isFeatured ? "Featured" : "Normal"}</div>
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
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-bold">{editing ? "Edit Image" : "Add Image"}</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Image</label>
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
                        setForm({ ...form, imageUrl: url });
                        showToast.success("Image uploaded successfully!");
                      } catch (err: any) {
                        showToast.error(err?.response?.data?.message || err.message || "Upload failed");
                      }
                    }}
                    className="block text-sm text-slate-300"
                  />
                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="flex-1 rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-sm"
                    placeholder="Or paste URL"
                  />
                </div>

                {form.imageUrl ? (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-white/10">
                    <img src={form.imageUrl} className="h-40 w-full object-cover" alt="Preview" />
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                  placeholder="Everest / Annapurna / Culture"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                />
                Featured
              </label>

              <button onClick={save} className="rounded-lg bg-sky-500 hover:bg-sky-600 px-4 py-2 font-semibold transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
