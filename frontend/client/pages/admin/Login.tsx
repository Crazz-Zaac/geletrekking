import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/apiClient";
import { setAuth } from "@/lib/auth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/api/admin/login", { email, password });
      const token = res.data?.token as string;
      const role = res.data?.role as "admin" | "superadmin";

      if (!token || !role) {
        throw new Error("Invalid login response");
      }

      // Save auth data
      setAuth(token, { email, role });

      // Navigate to admin dashboard
      navigate("/admin");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-extrabold">Admin Login</h1>
        <p className="text-sm text-slate-300 mt-1">
          Login to manage GELE TREKKING content.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/15 text-red-200 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-60 px-3 py-2 font-semibold transition-colors"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-xs text-slate-400 text-center">
            Tip: Create a superadmin using backend seeder if needed.
          </div>
        </form>
      </div>
    </div>
  );
}