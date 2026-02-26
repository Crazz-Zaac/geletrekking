import { useEffect, useState, useRef } from "react";
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

// ── Single toolbar button ─────────────────────────────────────
const Btn = ({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={{
      padding: "4px 9px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 600,
      lineHeight: "1.4",
      background: active ? "rgba(14,165,233,0.35)" : "rgba(255,255,255,0.07)",
      color: active ? "#7dd3fc" : "#cbd5e1",
      transition: "background 0.15s",
      whiteSpace: "nowrap",
    }}
    onMouseEnter={(e) => {
      if (!active)
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(255,255,255,0.14)";
    }}
    onMouseLeave={(e) => {
      if (!active)
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(255,255,255,0.07)";
    }}
  >
    {children}
  </button>
);

// ── Labeled group wrapper ─────────────────────────────────────
const Group = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <span
      style={{
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#64748b",
        paddingLeft: "2px",
      }}
    >
      {label}
    </span>
    <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
      {children}
    </div>
  </div>
);

// ── Divider ───────────────────────────────────────────────────
const Divider = () => (
  <div
    style={{
      width: "1px",
      background: "rgba(255,255,255,0.1)",
      margin: "0 6px",
      alignSelf: "stretch",
    }}
  />
);

// ── Rich Text Editor ──────────────────────────────────────────
const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    syncContent();
  };

  const syncContent = () => {
    if (!editorRef.current) return;
    isInternalUpdate.current = true;
    onChange(editorRef.current.innerHTML);
  };

  const block = (tag: string) => {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, tag);
    syncContent();
  };

  const q = (cmd: string) => {
    try { return document.queryCommandState(cmd); } catch { return false; }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) exec("insertImage", url);
  };

  return (
    <div
      style={{
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
        background: "rgba(15,23,42,0.6)",
      }}
    >
      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: "10px",
          padding: "10px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        {/* Heading */}
        <Group label="Heading">
          <Btn title="Heading 1" onClick={() => block("h1")}>H1</Btn>
          <Btn title="Heading 2" onClick={() => block("h2")}>H2</Btn>
          <Btn title="Heading 3" onClick={() => block("h3")}>H3</Btn>
          <Btn title="Paragraph" onClick={() => block("p")}>P</Btn>
        </Group>

        <Divider />

        {/* Format */}
        <Group label="Format">
          <Btn title="Bold" active={q("bold")} onClick={() => exec("bold")}>
            <b>B</b>
          </Btn>
          <Btn title="Italic" active={q("italic")} onClick={() => exec("italic")}>
            <i>I</i>
          </Btn>
          <Btn title="Underline" active={q("underline")} onClick={() => exec("underline")}>
            <u>U</u>
          </Btn>
          <Btn title="Strikethrough" onClick={() => exec("strikeThrough")}>
            <s>S</s>
          </Btn>
        </Group>

        <Divider />

        {/* List */}
        <Group label="List">
          <Btn title="Bullet List" onClick={() => exec("insertUnorderedList")}>• List</Btn>
          <Btn title="Numbered List" onClick={() => exec("insertOrderedList")}>1. List</Btn>
        </Group>

        <Divider />

        {/* Alignment */}
        <Group label="Alignment">
          <Btn title="Align Left" onClick={() => exec("justifyLeft")}>
            ≡ Left
          </Btn>
          <Btn title="Align Center" onClick={() => exec("justifyCenter")}>
            ≡ Center
          </Btn>
          <Btn title="Align Right" onClick={() => exec("justifyRight")}>
            ≡ Right
          </Btn>
        </Group>

        <Divider />

        {/* Insert */}
        <Group label="Insert">
          <Btn title="Blockquote" onClick={() => block("blockquote")}>❝ Quote</Btn>
          <Btn title="Insert Link" onClick={insertLink}>🔗 Link</Btn>
          <Btn title="Insert Image" onClick={insertImage}>🖼 Image</Btn>
          <Btn title="Horizontal Rule" onClick={() => exec("insertHorizontalRule")}>— Line</Btn>
        </Group>

        <Divider />

        {/* History */}
        <Group label="History">
          <Btn title="Undo" onClick={() => exec("undo")}>↩ Undo</Btn>
          <Btn title="Redo" onClick={() => exec("redo")}>↪ Redo</Btn>
        </Group>

        <Divider />

        {/* Clear */}
        <Group label="Clear">
          <Btn title="Remove Formatting" onClick={() => exec("removeFormat")}>✕ Clear</Btn>
        </Group>
      </div>

      {/* ── Editable area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncContent}
        onKeyUp={syncContent}
        style={{
          minHeight: "260px",
          padding: "14px 16px",
          outline: "none",
          color: "#e2e8f0",
          fontSize: "14px",
          lineHeight: "1.7",
          overflowY: "auto",
        }}
      />

      <style>{`
        [contenteditable] h1 { font-size: 1.6em; font-weight: 700; margin: 0.5em 0; }
        [contenteditable] h2 { font-size: 1.35em; font-weight: 700; margin: 0.5em 0; }
        [contenteditable] h3 { font-size: 1.15em; font-weight: 600; margin: 0.4em 0; }
        [contenteditable] p  { margin: 0.4em 0; }
        [contenteditable] ul { list-style: disc; padding-left: 1.4em; margin: 0.4em 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.4em; margin: 0.4em 0; }
        [contenteditable] blockquote {
          border-left: 3px solid #38bdf8;
          margin: 0.5em 0;
          padding: 4px 12px;
          color: #94a3b8;
          font-style: italic;
        }
        [contenteditable] a { color: #38bdf8; text-decoration: underline; }
        [contenteditable] img { max-width: 100%; border-radius: 6px; margin: 4px 0; }
        [contenteditable] hr { border: none; border-top: 1px solid rgba(255,255,255,0.15); margin: 12px 0; }
      `}</style>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
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
    } catch {
      showToast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  function startCreate() {
    setEditing(null);
    setForm({ title: "", slug: "", excerpt: "", content: "", coverImage: "", author: "", isPublished: false });
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
      <Toaster />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: list */}
        <div>
          <h1 className="text-2xl font-extrabold">Blogs</h1>
          <p className="text-sm text-slate-300 mt-1">Create and publish blog posts.</p>
          <div className="mt-4 flex items-center gap-2">
            <button onClick={startCreate} className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm">+ New Post</button>
            <button onClick={refresh} className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm">Refresh</button>
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
                    <button onClick={() => startEdit(b)} className="text-xs rounded-lg bg-sky-500/15 text-sky-200 hover:bg-sky-500/25 px-2 py-1">Edit</button>
                    <button onClick={() => remove(b._id)} className="text-xs rounded-lg bg-red-500/15 text-red-200 hover:bg-red-500/25 px-2 py-1">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-bold">{editing ? "Edit Post" : "Create Post"}</h2>
          <div className="mt-4 space-y-4">

            <div>
              <label className="block text-sm text-slate-300 mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none" />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Slug *</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none"
                placeholder="everest-base-camp-trek" />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Cover Image</label>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    showToast.loading("Uploading cover image...");
                    try {
                      const url = await uploadCover(file);
                      setForm({ ...form, coverImage: url });
                      showToast.success("Cover image uploaded successfully!");
                    } catch (err: any) {
                      showToast.error(err?.response?.data?.message || err.message || "Upload failed");
                    }
                  }}
                  className="block text-sm text-slate-300" />
                <input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="flex-1 rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none text-sm"
                  placeholder="Or paste URL" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Excerpt</label>
              <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={3} className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none" />
            </div>

            {/* Rich Text Content */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Content *</label>
              <RichTextEditor
                value={form.content}
                onChange={(val) => setForm((f: any) => ({ ...f, content: val }))}
              />
              <p className="text-xs text-slate-500 mt-1">
                Content is saved as HTML and will render formatted on the blog page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Author</label>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none" />
              </div>
              <label className="flex items-center gap-2 text-sm mt-6">
                <input type="checkbox" checked={!!form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
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
