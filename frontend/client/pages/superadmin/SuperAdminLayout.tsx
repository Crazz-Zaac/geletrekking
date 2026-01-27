import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "@/lib/auth";

const navItems = [
  { to: "/superadmin", label: "Dashboard" },
  { to: "/superadmin/admins", label: "Admins" },
  { to: "/superadmin/settings", label: "Settings" },
  { to: "/superadmin/hero", label: "Hero" },
  { to: "/superadmin/treks", label: "Treks" },
  { to: "/superadmin/blogs", label: "Blogs" },
  { to: "/superadmin/gallery", label: "Gallery" },
  { to: "/superadmin/testimonials", label: "Testimonials" },
  { to: "/superadmin/about", label: "About Page" },
];

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const user = getUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">GELE TREKKING</div>
            <h1 className="text-xl font-extrabold">Superadmin Dashboard</h1>
            <div className="text-xs text-slate-400 mt-1">
              {user?.email} • {user?.role}
            </div>
          </div>
          <button
            onClick={() => {
              clearAuth();
              navigate("/admin/login");
            }}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          <aside className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "px-3 py-2 rounded-lg text-sm",
                      isActive ? "bg-white/10" : "hover:bg-white/5",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
