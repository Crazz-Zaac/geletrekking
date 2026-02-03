import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

type Message = {
  _id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function AdminMessages() {
  const [items, setItems]       = useState<Message[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [filter, setFilter]     = useState<"all" | "unread" | "read">("all");

  /* ── fetch ── */
  async function refresh() {
    setLoading(true);
    try {
      const res = await api.get("/api/contact/admin");
      setItems(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  /* ── toggle read / unread ── */
  async function toggleRead(msg: Message) {
    try {
      const endpoint = msg.isRead
        ? `/api/contact/admin/${msg._id}/unread`
        : `/api/contact/admin/${msg._id}/read`;

      const res = await api.patch(endpoint);
      // update locally so UI reacts instantly
      setItems((prev) =>
        prev.map((m) => (m._id === res.data._id ? res.data : m))
      );
      // also update the selected detail pane if it's the same message
      if (selected?._id === res.data._id) setSelected(res.data);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to update");
    }
  }

  /* ── derived list based on active filter ── */
  const filtered = items.filter((m) => {
    if (filter === "unread") return !m.isRead;
    if (filter === "read")   return  m.isRead;
    return true;
  });

  const unreadCount = items.filter((m) => !m.isRead).length;

  /* ── helpers ── */
  const fmt = (date: string) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });

  /* ── render ── */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ===== LEFT – message list ===== */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Messages</h1>
            <p className="text-sm text-slate-300 mt-1">
              Contact form submissions from visitors.
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="rounded-full bg-sky-500/20 text-sky-200 text-xs font-semibold px-3 py-1">
              {unreadCount} unread
            </span>
          )}
        </div>

        {/* filter tabs */}
        <div className="mt-4 flex items-center gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "rounded-lg px-3 py-2 text-sm capitalize transition",
                filter === f
                  ? "bg-white/15 text-white"
                  : "bg-white/10 hover:bg-white/15 text-slate-300",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
          <button
            onClick={refresh}
            className="ml-auto rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm text-slate-300"
          >
            Refresh
          </button>
        </div>

        {/* list */}
        <div className="mt-4 space-y-2">
          {loading ? (
            <div className="text-slate-300">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-400 text-sm">
              No messages found.
            </div>
          ) : (
            filtered.map((m) => (
              <div
                key={m._id}
                onClick={() => setSelected(m)}
                className={[
                  "rounded-2xl border p-4 cursor-pointer transition",
                  selected?._id === m._id
                    ? "border-sky-500/40 bg-sky-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/8",
                ].join(" ")}
              >
                {/* top row: name + badge */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold truncate">{m.name}</span>
                  {!m.isRead && (
                    <span className="flex-shrink-0 ml-2 inline-block w-2.5 h-2.5 rounded-full bg-sky-400" />
                  )}
                </div>

                {/* email + date */}
                <div className="text-xs text-slate-400 mt-0.5 flex justify-between">
                  <span className="truncate">{m.email}</span>
                  <span className="flex-shrink-0 ml-2">{fmt(m.createdAt)}</span>
                </div>

                {/* message preview – single line */}
                <p className="text-sm text-slate-300 mt-1.5 line-clamp-1">
                  {m.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== RIGHT – detail pane ===== */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col">
        {selected ? (
          <>
            {/* header row */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-lg">{selected.name}</h2>
                <a
                  href={`mailto:${selected.email}`}
                  className="text-sm text-sky-300 hover:underline"
                >
                  {selected.email}
                </a>
              </div>

              {/* read / unread toggle button */}
              <button
                onClick={() => toggleRead(selected)}
                className={[
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition flex-shrink-0",
                  selected.isRead
                    ? "bg-slate-600/40 text-slate-300 hover:bg-slate-600/60"   // currently read  → click to unread
                    : "bg-sky-500/20 text-sky-200 hover:bg-sky-500/35",        // currently unread → click to read
                ].join(" ")}
              >
                {selected.isRead ? "Mark as Unread" : "Mark as Read"}
              </button>
            </div>

            {/* timestamp */}
            <p className="text-xs text-slate-500 mt-1">{fmt(selected.createdAt)}</p>

            {/* divider */}
            <hr className="border-white/10 my-4" />

            {/* message body */}
            <p className="text-slate-200 whitespace-pre-wrap flex-1">{selected.message}</p>

            {/* reply shortcut */}
            <a
              href={`mailto:${selected.email}?subject=Re%3A%20Your%20message%20to%20Gele%20Trekking`}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 px-4 py-2 font-semibold text-sm transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Reply via Email
            </a>
          </>
        ) : (
          /* empty state when nothing is selected */
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
            <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
}
