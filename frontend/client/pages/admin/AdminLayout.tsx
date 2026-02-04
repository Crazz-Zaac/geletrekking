import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { clearAuth, getUser } from "@/lib/auth";

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/settings", label: "Settings" },
    { to: "/admin/hero", label: "Hero" },
    { to: "/admin/treks", label: "Treks" },
    { to: "/admin/blogs", label: "Blogs" },
    { to: "/admin/gallery", label: "Gallery" },
    { to: "/admin/testimonials", label: "Testimonials" },
    { to: "/admin/about", label: "About Page" },
    { to: "/admin/messages", label: "Messages" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        {/* ================= SIDEBAR ================= */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-16"
          } h-screen sticky top-0 border-r border-white/10 p-5 transition-all duration-300`}
        >
          {/* TOGGLE BUTTON */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-4 p-2 rounded-lg hover:bg-white/5 transition"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-slate-400" />
            ) : (
              <Menu className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {sidebarOpen ? (
            <>
              {/* LOGO */}
              <Link to="/" className="block text-lg font-extrabold tracking-wide">
                GELE TREKKING
              </Link>

              {/* ROLE */}
              <p className="mt-1 text-xs text-slate-400">
                Admin Panel {user?.role && `• ${user.role}`}
              </p>

              {/* NAV */}
              <nav className="mt-6 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/admin"}
                    className={({ isActive }) =>
                      [
                        "block rounded-lg px-3 py-2 text-sm transition",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white",
                      ].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                {/* SUPERADMIN SECTION */}
                {user?.role === "superadmin" && (
                  <>
                    <div className="mt-4 px-3 text-xs uppercase tracking-wide text-slate-500">
                      Superadmin
                    </div>
                    <NavLink
                      to="/admin/admins"
                      className={({ isActive }) =>
                        [
                          "block rounded-lg px-3 py-2 text-sm transition",
                          isActive
                            ? "bg-purple-500/20 text-purple-200"
                            : "text-purple-300 hover:bg-purple-500/10",
                        ].join(" ")
                      }
                    >
                      Admin Management
                    </NavLink>
                  </>
                )}
              </nav>

              {/* LOGOUT */}
              <button
                onClick={() => {
                  clearAuth();
                  navigate("/admin/login");
                }}
                className="mt-8 w-full rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200 hover:bg-red-500/25"
              >
                Logout
              </button>
            </>
          ) : (
            // COLLAPSED STATE - ICON-ONLY NAV
            <nav className="mt-6 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  title={item.label}
                  className={({ isActive }) =>
                    [
                      "flex items-center justify-center w-10 h-10 rounded-lg transition",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white",
                    ].join(" ")
                  }
                >
                  {item.label.charAt(0)}
                </NavLink>
              ))}

              {user?.role === "superadmin" && (
                <NavLink
                  to="/admin/admins"
                  title="Admin Management"
                  className={({ isActive }) =>
                    [
                      "flex items-center justify-center w-10 h-10 rounded-lg transition mt-4",
                      isActive
                        ? "bg-purple-500/20 text-purple-200"
                        : "text-purple-400 hover:bg-purple-500/10",
                    ].join(" ")
                  }
                >
                  A
                </NavLink>
              )}

              {/* LOGOUT ICON */}
              <button
                onClick={() => {
                  clearAuth();
                  navigate("/admin/login");
                }}
                title="Logout"
                className="mt-8 w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/15 text-red-200 hover:bg-red-500/25"
              >
                ×
              </button>
            </nav>
          )}
        </aside>

        {/* ================= CONTENT ================= */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
