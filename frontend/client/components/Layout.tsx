import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/apiClient";

// ── Social Icons Component ─────────────────────────────────────
interface SocialIcon {
  name: string;
  href: string;
  colors: string[];
  svg: string;
}
const getSocialIcons = (social: any): SocialIcon[] => [
  {
    name: "Instagram",
    href: social?.instagram || "#",
    colors: ["#833ab4", "#fd1d1d", "#fcb045"],
    svg: `<rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="white" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3" fill="white"/>`,
  },
  {
    name: "Facebook",
    href: social?.facebook || "#",
    colors: ["#1877f2", "#42a5f5"],
    svg: `<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" fill="white"/>`,
  },
  {
    name: "Gmail",
    href: social?.gmail ? `mailto:${social.gmail}` : "#",
    colors: ["#EA4335", "#FBBC05", "#34A853", "#4285F4"],
    svg: `<path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" fill="none" stroke="white" stroke-width="1.5"/><path d="M2 7l10 7 10-7" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"/>`,
  },
  {
    name: "WhatsApp",
    href: social?.whatsapp ? `https://wa.me/${social.whatsapp.replace(/\D/g, "")}` : "#",
    colors: ["#25D366", "#128C7E", "#075E54"],
    svg: `<path d="M20.5 3.5A12 12 0 003.5 20.5L2 22l1.5-5.5A12 12 0 1020.5 3.5z" fill="none" stroke="white" stroke-width="1.8"/><path d="M9 11c.5 1 1.2 2 2.2 2.8 1 .8 2 1.3 3 1.5l1-1.2c.2-.2.5-.3.8-.1.8.3 1.7.6 2 .7.3.1.5.4.5.7v2c0 .6-.5 1-1 .9C8.5 17.5 6.5 8 7 7.5l2-2c.3-.3.8-.2 1 .1l1 2.2c.2.3.1.6-.1.8L9 11z" fill="white"/>`,
  },
  {
    name: "LinkedIn",
    href: social?.linkedin || "#",
    colors: ["#0077b5", "#00a0dc"],
    svg: `<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" fill="white"/><rect x="2" y="9" width="4" height="12" fill="white"/><circle cx="4" cy="4" r="2" fill="white"/>`,
  },
];

const SocialIconsRow = ({ social }: { social: any }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const icons = getSocialIcons(social);
  return (
    <div className="flex items-center gap-3 mt-1">
      {icons.map((icon, i) => {
        const gradId = `footer-grad-${i}`;
        const isHovered = hovered === icon.name;
        return (
          <a
            key={icon.name}
            href={icon.href}
            target={icon.href.startsWith("mailto") ? "_self" : "_blank"}
            rel="noopener noreferrer"
            aria-label={icon.name}
            onMouseEnter={() => setHovered(icon.name)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "block",
              transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              transform: isHovered ? "translateY(-5px) scale(1.12)" : "translateY(0) scale(1)",
            }}
          >
            <svg
              width="40" height="40" viewBox="0 0 24 24"
              style={{
                borderRadius: "10px", display: "block",
                boxShadow: isHovered ? "0 8px 20px rgba(0,0,0,0.5)" : "0 2px 6px rgba(0,0,0,0.3)",
                transition: "box-shadow 0.3s ease",
              }}
            >
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  {icon.colors.map((c, ci) => (
                    <stop key={ci} offset={`${(ci / (icon.colors.length - 1)) * 100}%`} stopColor={c} />
                  ))}
                </linearGradient>
              </defs>
              <rect width="24" height="24" fill={`url(#${gradId})`} rx="4" />
              <g dangerouslySetInnerHTML={{ __html: icon.svg }} />
            </svg>
          </a>
        );
      })}
    </div>
  );
};

// ── Header ─────────────────────────────────────────────────────
export const Header = ({ settings }: { settings: any }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [optionalTreks, setOptionalTreks] = useState<any[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchTreks = async () => {
      try {
        try {
          const destResponse = await api.get("/api/treks?type=destination");
          setDestinations(destResponse.data || []);
        } catch (err) {
          setDestinations([]);
        }
        try {
          const optResponse = await api.get("/api/treks?type=optional");
          setOptionalTreks(optResponse.data || []);
        } catch (err) {
          setOptionalTreks([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTreks();
  }, []);

  const phone = settings?.phone || "+977 9841 392186";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.10)" : "none",
      }}
    >
      {/* Top accent band */}
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg, #ff8f00, #ffa726, #4fc3f7, #0288d1)",
        }}
      />

      <div className="flex items-stretch">
        {/* ── Logo Block ── */}
        <div
          className="flex items-center gap-2 flex-shrink-0"
          style={{
            padding: "8px 20px 8px 16px",
            clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 100%, 0 100%)",
            background: "transparent",
            borderRight: "1.5px solid rgba(0,0,0,0.08)",
            marginRight: "8px",
          }}
        >
          {/* Logo image */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              border: "2px solid rgba(0,0,0,0.08)",
            }}
          >
            <img
              src="/geletrekking.png"
              alt="Gele Trekking Logo"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>

          {/* Logo text */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <div
              style={{
                fontFamily: "'Bebas Neue', 'Rajdhani', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: "#1a1a1a",
                letterSpacing: "3px",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {settings?.siteName || "GELE TREKKING"}
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#888",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontWeight: 600,
                marginTop: 4,
                whiteSpace: "nowrap",
              }}
            >
              Walk · Explore · Discover
            </div>
          </Link>
        </div>

        {/* ── Desktop Navigation ── */}
        <nav className="hidden lg:flex items-center gap-0 flex-1 px-2">
          <Link
            to="/"
            className={cn(
              "px-2.5 py-2 text-sm font-semibold rounded-md transition-all duration-150 whitespace-nowrap",
              location.pathname === "/" ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={cn(
              "px-2.5 py-2 text-sm font-semibold rounded-md transition-all duration-150 whitespace-nowrap",
              location.pathname === "/about" ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            About
          </Link>

          {/* Destinations Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("destinations")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link
              to="/destinations"
              className={cn(
                "flex items-center gap-1 px-2.5 py-2 text-sm font-semibold rounded-md transition-all duration-150 whitespace-nowrap",
                location.pathname.startsWith("/destination") ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              Destinations <ChevronDown className="w-3 h-3" />
            </Link>
            {activeDropdown === "destinations" && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-2 min-w-[220px] z-50">
                {loading ? (
                  <div className="px-4 py-2 text-sm text-gray-400">Loading...</div>
                ) : destinations.length > 0 ? (
                  destinations.map((trek) => (
                    <Link
                      key={trek._id}
                      to={`/destination/${trek._id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors capitalize"
                    >
                      {trek.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-400">No destinations available</div>
                )}
              </div>
            )}
          </div>

          <Link
            to="/gallery"
            className={cn(
              "px-2.5 py-2 text-sm font-semibold rounded-md transition-all duration-150 whitespace-nowrap",
              location.pathname === "/gallery" ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            Gallery
          </Link>
          <Link
            to="/activities"
            className={cn(
              "px-2.5 py-2 text-sm font-semibold rounded-md transition-all duration-150 whitespace-nowrap",
              location.pathname === "/activities" ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            Activities
          </Link>

          {/* Optional Treks Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("optional")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link
              to="/optional-treks"
              className={cn(
                "flex items-center gap-1 px-2.5 py-2 text-sm font-semibold rounded-md transition-all duration-150 whitespace-nowrap",
                location.pathname.startsWith("/optional-trek") ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              Optional Treks <ChevronDown className="w-3 h-3" />
            </Link>
            {activeDropdown === "optional" && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-2 min-w-[220px] z-50">
                {loading ? (
                  <div className="px-4 py-2 text-sm text-gray-400">Loading...</div>
                ) : optionalTreks.length > 0 ? (
                  optionalTreks.map((trek) => (
                    <Link
                      key={trek._id}
                      to={`/optional-trek/${trek._id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors capitalize"
                    >
                      {trek.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-400">No optional treks available</div>
                )}
              </div>
            )}
          </div>

          <Link
            to="/testimonials"
            className={cn(
              "px-2.5 py-2 text-sm font-semibold rounded-md transition-all duration-150 whitespace-nowrap",
              location.pathname === "/testimonials" ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            Testimonials
          </Link>
          <Link
            to="/blog"
            className={cn(
              "px-2.5 py-2 text-sm font-semibold rounded-md transition-all duration-150 whitespace-nowrap",
              location.pathname === "/blog" ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            Blog
          </Link>
          <Link
            to="/contact"
            className={cn(
              "px-2.5 py-2 text-sm font-semibold rounded-md transition-all duration-150 whitespace-nowrap",
              location.pathname === "/contact" ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            Contact
          </Link>
        </nav>

        {/* ── Phone Info (right side) ── */}
        <div className="hidden lg:flex items-center gap-2 px-3 border-l border-gray-100 flex-shrink-0">
          <div
            style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, #0288d1, #4fc3f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Phone size={15} color="#fff" />
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0288d1", whiteSpace: "nowrap" }}>{phone}</div>
            <div style={{ fontSize: 9, color: "#aaa", letterSpacing: "0.8px", textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap" }}>
              Direct Call or WhatsApp 24/7
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center ml-auto px-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-gray-200 py-4 max-h-[calc(100vh-5rem)] overflow-y-auto bg-white">
          {[
            { to: "/", label: "Home" },
            { to: "/about", label: "About Us" },
            { to: "/destinations", label: "Destinations" },
            { to: "/gallery", label: "Gallery" },
            { to: "/activities", label: "Company Activities" },
            { to: "/optional-treks", label: "Optional Treks" },
            { to: "/testimonials", label: "Testimonials" },
            { to: "/blog", label: "Blog" },
            { to: "/contact", label: "Contact Us" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block px-5 py-2.5 text-sm font-semibold transition-colors",
                location.pathname === to ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {label}
            </Link>
          ))}
          {!loading && destinations.length > 0 && (
            <div className="ml-5 space-y-1 border-l-2 border-orange-100 pl-3">
              {destinations.map((trek) => (
                <Link key={trek._id} to={`/destination/${trek._id}`} onClick={() => setMobileMenuOpen(false)} className="block py-1 text-xs text-gray-500 hover:text-orange-600 capitalize">
                  {trek.name}
                </Link>
              ))}
            </div>
          )}
          <div className="mt-4 mx-5 flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Phone size={16} className="text-blue-500" />
            <div>
              <div className="text-sm font-bold text-blue-600">{phone}</div>
              <div className="text-xs text-gray-500">WhatsApp 24/7</div>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

// ── Footer ─────────────────────────────────────────────────────
export const Footer = ({ settings }: { settings: any }) => {
  return (
    <footer className="text-white mt-20" style={{ backgroundColor: "#26275E" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <img src="/geletrekking.png" alt="Gele Trekking Logo" className="h-8 w-8 rounded-full object-cover border border-white/20 shadow-sm" />
              {settings?.siteName || "GELE TREKKING"}
            </h3>
            <p className="text-gray-300 text-sm">Explore the world, one trail at a time. Experience breathtaking adventures with expert guides.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/destinations" className="hover:text-orange-400">Destinations</Link></li>
              <li><Link to="/gallery" className="hover:text-orange-400">Gallery</Link></li>
              <li><Link to="/blog" className="hover:text-orange-400">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-orange-400">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/about" className="hover:text-orange-400">About Us</Link></li>
              <li><Link to="/activities" className="hover:text-orange-400">Activities</Link></li>
              <li><Link to="/testimonials" className="hover:text-orange-400">Testimonials</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <SocialIconsRow social={settings?.social} />
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} {settings?.siteName || "GELE TREKKING"}. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-orange-400">Terms</a>
            <a href="#" className="hover:text-orange-400">Privacy</a>
            <a href="#" className="hover:text-orange-400">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ── Layout ─────────────────────────────────────────────────────
export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<any>(null);
  useEffect(() => {
    api.get("/api/settings").then((res) => setSettings(res.data)).catch(() => setSettings(null));
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} />
      <main className="flex-1 pt-20">{children}</main>
      <Footer settings={settings} />
    </div>
  );
};
