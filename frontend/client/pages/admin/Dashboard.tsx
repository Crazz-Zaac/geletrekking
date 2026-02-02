import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export default function AdminDashboard() {
  const { data: treks } = useQuery({
    queryKey: ["admin-treks-count"],
    queryFn: async () => (await api.get("/api/treks")).data,
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Dashboard</h1>
      <p className="text-sm text-slate-300 mt-1">
        Manage site content from here.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-slate-300">Treks</div>
          <div className="text-3xl font-extrabold mt-2">
            {Array.isArray(treks) ? treks.length : "—"}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-slate-300">Quick Links</div>
          <div className="mt-2 text-sm text-slate-200">
            Use the sidebar to edit Settings, Hero, and other pages.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-slate-300">Status</div>
          <div className="mt-2 text-sm text-slate-200">✅ Admin authenticated</div>
        </div>
      </div>
    </div>
  );
}
