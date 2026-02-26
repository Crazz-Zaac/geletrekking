import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/apiClient";

// ── Social Icons Component ─────────────────────────────────────
interface SocialIcon {
  name: string;
  href: string;
  colors: string[];
  svg: string;
}

const socialIcons: SocialIcon[] = [
  {
    name: "Instagram",
    href: "#",
    colors: ["#833ab4", "#fd1d1d", "#fcb045"],
    svg: `<rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="white" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3" fill="white"/>`,
  },
  {
    name: "Facebook",
    href: "#",
    colors: ["#1877f2", "#42a5f5"],
    svg: `<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" fill="white"/>`,
  },
  {
    name: "Gmail",
    href: "#",
    colors: ["#EA4335", "#FBBC05", "#34A853", "#4285F4"],
    svg: `<path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" fill="none" stroke="white" stroke-width="1.5"/><path d="M2 7l10 7 10-7" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"/>`,
  },
  {
    name: "WhatsApp",
    href: "#",
    colors: ["#25D366", "#128C7E", "#075E54"],
    svg: `<path d="M20.5 3.5A12 12 0 003.5 20.5L2 22l1.5-5.5A12 12 0 1020.5 3.5z" fill="none" stroke="white" stroke-width="1.8"/><path d="M9 11c.5 1 1.2 2 2.2 2.8 1 .8 2 1.3 3 1.5l1-1.2c.2-.2.5-.3.8-.1.8.3 1.7.6 2 .7.3.1.5.4.5.7v2c0 .6-.5 1-1 .9C8.5 17.5 6.5 8 7 7.5l2-2c.3-.3.8-.2 1 .1l1 2.2c.2.3.1.6-.1.8L9 11z" fill="white"/>`,
  },
];

const SocialIconsRow = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3 mt-1">
      {socialIcons.map((icon, i) => {
        const gradId = `footer-grad-${i}`;
        const isHovered = hovered === icon.name;
        return (
          <a
            key={icon.name}
            href={icon.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={icon.name}
            onMouseEnter={() => setHovered(icon.name)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "block",
              transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              transform: isHovered
                ? "translateY(-5px) scale(1.12)"
                : "translateY(0) scale(1)",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              style={{
                borderRadius: "10px",
                display: "block",
                boxShadow: isHovered
                  ? "0 8px 20px rgba(0,0,0,0.5)"
                  : "0 2px 6px rgba(0,0,0,0.3)",
                transition: "box-shadow 0.3s ease",
              }}
            >
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  {icon.colors.map((c, ci) => (
                    <stop
                      key={ci}
                      offset={`${(ci / (icon.colors.length - 1)) * 100}%`}
                      stopColor={c}
                    />
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

  useEffect(() => {
    const fetchTreks = async () => {
      try {
        try {
          const destResponse = await api.get("/api/treks?type=destination");
          setDestinations(destResponse.data || []);
        } catch (err) {
          console.error("Error fetching destination treks:", err);
          setDestinations([]);
        }
        try {
          const optResponse = await api.get("/api/treks?type=optional");
          setOptionalTreks(optResponse.data || []);
        } catch (err) {
          console.error("Error fetching optional treks:", err);
          setOptionalTreks([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTreks();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/geletrekking.png"
              alt="Gele Trekking Logo"
              className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm"
            />
            <span className="hidden sm:inline text-xl font-bold text-brand-dark">
              {settings?.siteName || "GELE TREKKING"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-accent",
                location.pathname === "/" ? "text-brand-accent" : "text-gray-700"
              )}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-accent",
                location.pathname === "/about" ? "text-brand-accent" : "text-gray-700"
              )}
            >
              About Us
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
                  "flex items-center gap-1 text-sm font-medium transition-colors hover:text-brand-accent",
                  location.pathname.startsWith("/destination")
                    ? "text-brand-accent"
                    : "text-gray-700"
                )}
              >
                Destinations
                <ChevronDown className="w-4 h-4" />
              </Link>
              {activeDropdown === "destinations" && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[220px] z-50">
                  {loading ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                  ) : destinations.length > 0 ? (
                    destinations.map((trek) => (
                      <Link
                        key={trek._id}
                        to={`/destination/${trek._id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-accent transition-colors capitalize"
                      >
                        {trek.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No destinations available</div>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/gallery"
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-accent",
                location.pathname === "/gallery" ? "text-brand-accent" : "text-gray-700"
              )}
            >
              Gallery
            </Link>
            <Link
              to="/activities"
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-accent",
                location.pathname === "/activities" ? "text-brand-accent" : "text-gray-700"
              )}
            >
              Company Activities
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
                  "flex items-center gap-1 text-sm font-medium transition-colors hover:text-brand-accent",
                  location.pathname.startsWith("/optional-trek")
                    ? "text-brand-accent"
                    : "text-gray-700"
                )}
              >
                Optional Treks
                <ChevronDown className="w-4 h-4" />
              </Link>
              {activeDropdown === "optional" && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[220px] z-50">
                  {loading ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                  ) : optionalTreks.length > 0 ? (
                    optionalTreks.map((trek) => (
                      <Link
                        key={trek._id}
                        to={`/optional-trek/${trek._id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-accent transition-colors capitalize"
                      >
                        {trek.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No optional treks available</div>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/testimonials"
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-accent",
                location.pathname === "/testimonials" ? "text-brand-accent" : "text-gray-700"
              )}
            >
              Testimonials
            </Link>
            <Link
              to="/blog"
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-accent",
                location.pathname === "/blog" ? "text-brand-accent" : "text-gray-700"
              )}
            >
              Blog
            </Link>
            <Link
              to="/contact"
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-accent",
                location.pathname === "/contact" ? "text-brand-accent" : "text-gray-700"
              )}
            >
              Contact Us
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-gray-200 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className={cn("block px-4 py-2 text-sm font-medium rounded-lg transition-colors", location.pathname === "/" ? "bg-brand-accent/10 text-brand-accent" : "text-gray-700 hover:bg-gray-100")}>Home</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className={cn("block px-4 py-2 text-sm font-medium rounded-lg transition-colors", location.pathname === "/about" ? "bg-brand-accent/10 text-brand-accent" : "text-gray-700 hover:bg-gray-100")}>About Us</Link>
            <Link to="/destinations" onClick={() => setMobileMenuOpen(false)} className={cn("block px-4 py-2 text-sm font-medium rounded-lg transition-colors", location.pathname === "/destinations" ? "bg-brand-accent/10 text-brand-accent" : "text-gray-700 hover:bg-gray-100")}>Destinations</Link>
            {!loading && destinations.length > 0 && (
              <div className="ml-4 space-y-1">
                {destinations.map((trek) => (
                  <Link key={trek._id} to={`/destination/${trek._id}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-1.5 text-xs text-gray-600 hover:text-brand-accent capitalize">• {trek.name}</Link>
                ))}
              </div>
            )}
            <Link to="/gallery" onClick={() => setMobileMenuOpen(false)} className={cn("block px-4 py-2 text-sm font-medium rounded-lg transition-colors", location.pathname === "/gallery" ? "bg-brand-accent/10 text-brand-accent" : "text-gray-700 hover:bg-gray-100")}>Gallery</Link>
            <Link to="/activities" onClick={() => setMobileMenuOpen(false)} className={cn("block px-4 py-2 text-sm font-medium rounded-lg transition-colors", location.pathname === "/activities" ? "bg-brand-accent/10 text-brand-accent" : "text-gray-700 hover:bg-gray-100")}>Company Activities</Link>
            <Link to="/optional-treks" onClick={() => setMobileMenuOpen(false)} className={cn("block px-4 py-2 text-sm font-medium rounded-lg transition-colors", location.pathname === "/optional-treks" ? "bg-brand-accent/10 text-brand-accent" : "text-gray-700 hover:bg-gray-100")}>Optional Treks</Link>
            {!loading && optionalTreks.length > 0 && (
              <div className="ml-4 space-y-1">
                {optionalTreks.map((trek) => (
                  <Link key={trek._id} to={`/optional-trek/${trek._id}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-1.5 text-xs text-gray-600 hover:text-brand-accent capitalize">• {trek.name}</Link>
                ))}
              </div>
            )}
            <Link to="/testimonials" onClick={() => setMobileMenuOpen(false)} className={cn("block px-4 py-2 text-sm font-medium rounded-lg transition-colors", location.pathname === "/testimonials" ? "bg-brand-accent/10 text-brand-accent" : "text-gray-700 hover:bg-gray-100")}>Testimonials</Link>
            <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className={cn("block px-4 py-2 text-sm font-medium rounded-lg transition-colors", location.pathname === "/blog" ? "bg-brand-accent/10 text-brand-accent" : "text-gray-700 hover:bg-gray-100")}>Blog</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className={cn("block px-4 py-2 text-sm font-medium rounded-lg transition-colors", location.pathname === "/contact" ? "bg-brand-accent/10 text-brand-accent" : "text-gray-700 hover:bg-gray-100")}>Contact Us</Link>
          </nav>
        )}
      </div>
    </header>
  );
};

// ── Footer ─────────────────────────────────────────────────────
export const Footer = ({ settings }: { settings: any }) => {
  return (
    <footer className="text-white mt-20" style={{ backgroundColor: "#26275E" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <img
                src="/geletrekking.png"
                alt="Gele Trekking Logo"
                className="h-8 w-8 rounded-full object-cover border border-white/20 shadow-sm"
              />
              {settings?.siteName || "GELE TREKKING"}
            </h3>
            <p className="text-gray-300 text-sm">
              Explore the world, one trail at a time. Experience breathtaking
              adventures with expert guides.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/destinations" className="hover:text-brand-accent">Destinations</Link></li>
              <li><Link to="/gallery" className="hover:text-brand-accent">Gallery</Link></li>
              <li><Link to="/blog" className="hover:text-brand-accent">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-brand-accent">Contact</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/about" className="hover:text-brand-accent">About Us</Link></li>
              <li><Link to="/activities" className="hover:text-brand-accent">Activities</Link></li>
              <li><Link to="/testimonials" className="hover:text-brand-accent">Testimonials</Link></li>
            </ul>
          </div>

          {/* Social Media — replaces old Contact column */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <SocialIconsRow />
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {settings?.siteName || "GELE TREKKING"}. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-brand-accent">Terms</a>
            <a href="#" className="hover:text-brand-accent">Privacy</a>
            <a href="#" className="hover:text-brand-accent">Cookies</a>
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
    api
      .get("/api/settings")
      .then((res) => setSettings(res.data))
      .catch(() => setSettings(null));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer settings={settings} />
    </div>
  );
};
