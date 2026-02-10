import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Toaster } from "react-hot-toast";
import { showToast } from "@/lib/toast";

type Blog = any;

async function uploadCover(file: File) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await api.post(`/api/uploads/image?folder=blog`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.url as string;
}

export default function AdminBlogs() {
  const [items, setItems] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState<any>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    author: "",
    isPublished: false,
  });

  async function refresh() {
    setLoading(true);
    try {
      const res = await api.get("/api/blogs/admin");
      setItems(res.data || []);
    } catch (error: any) {
      showToast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function startCreate() {
    setEditing(null);
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      author: "",
      isPublished: false,
    });
  }

  function startEdit(b: Blog) {
    setEditing(b);
    setForm({
      title: b.title || "",
      slug: b.slug || "",
      excerpt: b.excerpt || "",
      content: b.content || "",
      coverImage: b.coverImage || "",
      author: b.author || "",
      isPublished: !!b.isPublished,
    });
  }

  async function save() {
    try {
      if (editing?._id) {
        await api.put(`/api/blogs/${editing._id}`, form);
        showToast.success("Blog post updated successfully!");
      } else {
        await api.post("/api/blogs", form);
        showToast.success("Blog post created successfully!");
      }
      await refresh();
      startCreate();
    } catch (e: any) {
      showToast.error(e?.response?.data?.message || e.message || "Failed to save blog post");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this blog post?")) return;
    
    try {
      await api.delete(`/api/blogs/${id}`);
      showToast.success("Blog post deleted successfully!");
      await refresh();
    } catch (e: any) {
      showToast.error(e?.response?.data?.message || e.message || "Failed to delete blog post");
    }
  }

  return (
    <>
      {/* Toast Container */}
      <Toaster />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h1 className="text-2xl font-extrabold">Blogs</h1>
          <p className="text-sm text-slate-300 mt-1">Create and publish blog posts.</p>

          <div className="mt-4 flex items-center gap-2">
            <button onClick={startCreate} className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm">
              + New Post
            </button>
            <button onClick={refresh} className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm">
              Refresh
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="text-slate-300">Loading...</div>
            ) : (
              items.map((b) => (
                <div key={b._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold">{b.title}</div>
                  <div className="text-xs text-slate-400 mt-1">/{b.slug} • {b.isPublished ? "Published" : "Draft"}</div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => startEdit(b)}
                      className="text-xs rounded-lg bg-sky-500/15 text-sky-200 hover:bg-sky-500/25 px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(b._id)}
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
          <h2 className="font-bold">{editing ? "Edit Post" : "Create Post"}</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Slug *</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                placeholder="everest-base-camp-trek"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Cover Image</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const loadingToast = showToast.loading("Uploading cover image...");
                    try {
                      const url = await uploadCover(file);
                      setForm({ ...form, coverImage: url });
                      showToast.success("Cover image uploaded successfully!");
                    } catch (err: any) {
                      showToast.error(err?.response?.data?.message || err.message || "Upload failed");
                    }
                  }}
                  className="block text-sm text-slate-300"
                />
                <input
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="flex-1 rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-sm"
                  placeholder="Or paste URL"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={3}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Content *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={10}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Author</label>
                <input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm mt-6">
                <input
                  type="checkbox"
                  checked={!!form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                />
                Published
              </label>
            </div>

            <button onClick={save} className="rounded-lg bg-sky-500 hover:bg-sky-600 px-4 py-2 font-semibold transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
