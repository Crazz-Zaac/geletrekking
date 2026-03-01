import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard,
  Settings,
  Flame,
  Mountain,
  FileText,
  Image,
  MessageSquare,
  Info,
  Mail,
  Users,
  LogOut,
  Moon,
  Sun,
  Activity  // ✅ NEW
} from "lucide-react";
import { clearAuth, getUser } from "@/lib/auth";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

function AdminLayoutContent() {
  const navigate = useNavigate();
  const user = getUser();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { to: "/admin",              label: "Dashboard",    icon: LayoutDashboard },
    { to: "/admin/settings",     label: "Settings",     icon: Settings },
    { to: "/admin/hero",         label: "Hero",         icon: Flame },
    { to: "/admin/treks",        label: "Treks",        icon: Mountain },
    { to: "/admin/blogs",        label: "Blogs",        icon: FileText },
    { to: "/admin/gallery",      label: "Gallery",      icon: Image },
    { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
    { to: "/admin/about",        label: "About Page",   icon: Info },
    { to: "/admin/activities",   label: "Activities",   icon: Activity }, // ✅ NEW
    { to: "/admin/messages",     label: "Messages",     icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="flex">
        {/* ================= SIDEBAR ================= */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-16"
          } h-screen sticky top-0 border-r border-slate-300 dark:border-white/10 bg-white dark:bg-slate-950 p-5 transition-all duration-300 flex flex-col shadow-sm`}
        >
          {sidebarOpen ? (
            <>
              {/* LOGO */}
              <Link to="/" className="block text-lg font-extrabold tracking-wide text-slate-900 dark:text-white">
                GELE TREKKING
              </Link>
              {/* ROLE */}
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Admin Panel {user?.role && `• ${user.role}`}
              </p>

              {/* THEME TOGGLE */}
              <button
                onClick={toggleTheme}
                className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200"
              >
                {isDark ? (
                  <>
                    <Sun className="w-5 h-5 text-yellow-500" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5 text-slate-700" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              {/* NAV */}
              <nav className="mt-6 space-y-1 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/admin"}
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                          isActive
                            ? "bg-blue-100 dark:bg-white/10 text-blue-700 dark:text-white font-medium"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
                        ].join(" ")
                      }
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </NavLink>
                  );
                })}

                {/* SUPERADMIN SECTION */}
                {user?.role === "superadmin" && (
                  <>
                    <div className="mt-4 px-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-500 font-semibold">
                      Superadmin
                    </div>
                    <NavLink
                      to="/admin/admins"
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                          isActive
                            ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200 font-medium"
                            : "text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10",
                        ].join(" ")
                      }
                    >
                      <Users className="w-5 h-5" />
                      User Management
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
                className="mt-4 w-full flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-500/15 px-3 py-2 text-sm text-red-700 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-500/25 transition font-medium"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>

              {/* TOGGLE BUTTON AT BOTTOM */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mt-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </>
          ) : (
            // COLLAPSED STATE - ICON-ONLY NAV
            <>
              {/* THEME TOGGLE ICON */}
              <button
                onClick={toggleTheme}
                title={isDark ? "Light Mode" : "Dark Mode"}
                className="mb-4 w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700" />
                )}
              </button>

              <nav className="space-y-2 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/admin"}
                      title={item.label}
                      className={({ isActive }) =>
                        [
                          "flex items-center justify-center w-10 h-10 rounded-lg transition",
                          isActive
                            ? "bg-blue-100 dark:bg-white/10 text-blue-700 dark:text-white"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
                        ].join(" ")
                      }
                    >
                      <Icon className="w-5 h-5" />
                    </NavLink>
                  );
                })}

                {user?.role === "superadmin" && (
                  <NavLink
                    to="/admin/admins"
                    title="User Management"
                    className={({ isActive }) =>
                      [
                        "flex items-center justify-center w-10 h-10 rounded-lg transition mt-4",
                        isActive
                          ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200"
                          : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10",
                      ].join(" ")
                    }
                  >
                    <Users className="w-5 h-5" />
                  </NavLink>
                )}
              </nav>

              {/* LOGOUT ICON */}
              <button
                onClick={() => {
                  clearAuth();
                  navigate("/admin/login");
                }}
                title="Logout"
                className="mt-4 w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-500/25 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* TOGGLE BUTTON AT BOTTOM */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mt-4 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </>
          )}
        </aside>

        {/* ================= CONTENT ================= */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <ThemeProvider>
      <AdminLayoutContent />
    </ThemeProvider>
  );
}