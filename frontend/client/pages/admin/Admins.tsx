import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "@/lib/apiClient";
import { getToken, getUser } from "@/lib/auth";

type Role = "admin" | "superadmin";

type AdminRow = {
  _id: string;
  email: string;
  role: Role;
  createdAt?: string;
};

export default function Admins() {
  const user = getUser();

  // 🔐 HARD BLOCK: only superadmin
  if (user?.role !== "superadmin") {
    return <Navigate to="/admin" replace />;
  }

  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("admin");

  const token = getToken();

  /* ===================== LOAD ADMINS ===================== */
  async function loadAdmins() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.get("/api/admin/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data || []);
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  /* ===================== CREATE ===================== */
  async function createAdmin() {
    setMsg(null);
    try {
      await api.post(
        "/api/admin/admins",
        { email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmail("");
      setPassword("");
      setRole("admin");
      setMsg("✅ Admin created successfully");
      await loadAdmins();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Create failed");
    }
  }

  /* ===================== DELETE ===================== */
  async function deleteAdmin(id: string) {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    setMsg(null);
    try {
      await api.delete(`/api/admin/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg("✅ Admin deleted");
      await loadAdmins();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Delete failed");
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-extrabold">Admin Management</h1>
      <p className="text-sm text-slate-400 mt-1">
        Only superadmin can create or delete admins
      </p>

      {msg && (
        <div className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm">
          {msg}
        </div>
      )}

      {/* ===================== CREATE FORM ===================== */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="font-semibold mb-3">Create Admin</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 outline-none"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 outline-none"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 outline-none"
          >
            <option value="admin">admin</option>
            <option value="superadmin">superadmin</option>
          </select>
        </div>

        <button
          onClick={createAdmin}
          disabled={!email || !password}
          className="mt-4 rounded-lg bg-sky-500 hover:bg-sky-600 px-4 py-2 font-semibold disabled:opacity-50"
        >
          Create
        </button>
      </div>

      {/* ===================== LIST ===================== */}
      <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden">
        <div className="bg-white/5 px-4 py-2 text-sm font-semibold">
          Existing Admins
        </div>

        {loading ? (
          <div className="p-4 text-sm text-slate-300">Loading…</div>
        ) : (
          <div className="divide-y divide-white/10">
            {admins.map((a) => {
              const isSelf = a._id === user?._id;
              const protectedAdmin = a.role === "superadmin";

              return (
                <div
                  key={a._id}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">{a.email}</div>
                    <div className="text-xs text-slate-400 capitalize">
                      {a.role}
                    </div>
                  </div>

                  {protectedAdmin || isSelf ? (
                    <span className="text-xs text-slate-400">
                      protected
                    </span>
                  ) : (
                    <button
                      onClick={() => deleteAdmin(a._id)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"
                    >
                      Delete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
