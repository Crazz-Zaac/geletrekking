import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/apiClient";

// ── Social Icons ───────────────────────────────────────────────────────────

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
    <div className="flex items-center gap-1.5">
      {icons.map((icon, i) => {
        const gradId = `nav-grad-${i}`;
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
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{
              transition: "transform 0.2s ease",
              transform: isHovered ? "translateY(-2px)" : "translateY(0)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
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

// ── Header ─────────────────────────────────────────────────────────────────

export const Header = ({ settings }: { settings: any }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [optionalTreks, setOptionalTreks] = useState<any[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchTreks = async () => {
      try {
        try {
          const destResponse = await api.get("/api/treks?type=destination");
          setDestinations(destResponse.data || []);
        } catch { setDestinations([]); }
        try {
          const optResponse = await api.get("/api/treks?type=optional");
          setOptionalTreks(optResponse.data || []);
        } catch { setOptionalTreks([]); }
      } finally {
        setLoading(false);
      }
    };
    fetchTreks();
  }, []);

  const siteName = settings?.siteName || "GELE TREKKING";
  const phone    = settings?.phone    || "+977 9841 392186";

  const navLinks = [
    { label: "Home",          to: "/" },
    { label: "About",         to: "/about" },
    { label: "Destinations",  to: "/destinations",   dropdown: "destinations" },
    { label: "Gallery",       to: "/gallery" },
    { label: "Activities",    to: "/activities" },
    { label: "Optional Treks",to: "/optional-treks", dropdown: "optional" },
    { label: "Testimonials",  to: "/testimonials" },
    { label: "Blog",          to: "/blog" },
    { label: "Contact",       to: "/contact" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[oklch(0.15_0.02_240/0.97)] backdrop-blur-md shadow-lg"
          : "bg-[oklch(0.15_0.02_240/0.55)] backdrop-blur-sm"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <img
            src="/geletrekking.png"
            alt={siteName}
            className="w-9 h-9 rounded-lg object-cover border border-white/20 shadow flex-shrink-0"
          />
          <div className="hidden sm:block">
            <div className="font-bold text-white text-sm leading-tight tracking-widest uppercase group-hover:text-accent transition-colors">
              {siteName}
            </div>
            <div className="text-white/50 text-[8px] uppercase tracking-[2px] leading-tight">
              Walk · Explore · Discover
            </div>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <ul className="hidden lg:flex items-center">
          {navLinks.map((link) =>
            link.dropdown ? (
              <li
                key={link.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(link.dropdown!)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.to}
                  className={cn(
                    "flex items-center gap-0.5 px-2 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                    location.pathname.startsWith(link.to)
                      ? "text-white bg-white/15"
                      : "text-white/85 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 flex-shrink-0 transition-transform duration-200",
                      activeDropdown === link.dropdown && "rotate-180"
                    )}
                  />
                </Link>

                {activeDropdown === link.dropdown && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                    <div className="bg-white rounded-xl shadow-2xl border border-border p-2 min-w-[200px]">
                      {loading ? (
                        <div className="px-4 py-2 text-sm text-muted-foreground">Loading...</div>
                      ) : (link.dropdown === "destinations" ? destinations : optionalTreks).length > 0 ? (
                        (link.dropdown === "destinations" ? destinations : optionalTreks).map((trek) => (
                          <Link
                            key={trek._id}
                            to={link.dropdown === "destinations" ? `/destination/${trek._id}` : `/optional-trek/${trek._id}`}
                            className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary hover:text-primary rounded-lg transition-colors font-medium capitalize"
                          >
                            {trek.name}
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-muted-foreground">None available</div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ) : (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className={cn(
                    "px-2 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                    location.pathname === link.to
                      ? "text-white bg-white/15"
                      : "text-white/85 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            )
          )}
        </ul>

        {/* ── Right side: socials + phone + Book Now + mobile toggle ── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Social icons */}
          <div className="hidden xl:flex items-center border-r border-white/20 pr-2 mr-1">
            <SocialIconsRow social={settings?.social} />
          </div>

          {/* Phone */}
          <a
            href={`tel:${phone}`}
            className="hidden xl:flex items-center gap-1 text-white/80 hover:text-white transition-colors text-xs font-medium whitespace-nowrap"
          >
            {phone}
          </a>

          {/* Book Now CTA */}
          <Link
            to="/contact"
            className="hidden md:inline-flex items-center bg-accent text-accent-foreground text-xs font-semibold px-3 py-2 rounded-lg hover:bg-accent/90 transition-colors ml-1 whitespace-nowrap"
          >
            Book Now
          </Link>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Nav ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[oklch(0.15_0.02_240/0.98)] backdrop-blur-md border-t border-white/10 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link
                  to={link.to}
                  className={cn(
                    "block px-3 py-2.5 font-medium rounded-md transition-colors",
                    location.pathname === link.to || location.pathname.startsWith(link.to + "/")
                      ? "text-white bg-white/15"
                      : "text-white/85 hover:text-white hover:bg-white/10"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>

                {/* Inline dropdown items for mobile */}
                {link.dropdown && !loading && (
                  <div className="pl-4 space-y-0.5 mt-1">
                    {(link.dropdown === "destinations" ? destinations : optionalTreks).map((trek) => (
                      <Link
                        key={trek._id}
                        to={link.dropdown === "destinations" ? `/destination/${trek._id}` : `/optional-trek/${trek._id}`}
                        className="block px-3 py-2 text-white/60 text-sm hover:text-white hover:bg-white/10 rounded-md transition-colors capitalize"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {trek.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Bottom of mobile menu */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <SocialIconsRow social={settings?.social} />
              </div>
              <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
                <span>{phone}</span>
              </div>
              <Link
                to="/contact"
                className="flex justify-center bg-accent text-accent-foreground font-semibold px-4 py-3 rounded-lg hover:bg-accent/90 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book a Trek
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// ── Footer ─────────────────────────────────────────────────────────────────

export const Footer = ({ settings }: { settings: any }) => {
  return (
    <footer className="text-white mt-20" style={{ backgroundColor: "#26275E" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
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
              Explore the world, one trail at a time. Experience breathtaking adventures with expert guides.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/destinations" className="hover:text-accent transition-colors">Destinations</Link></li>
              <li><Link to="/gallery" className="hover:text-accent transition-colors">Gallery</Link></li>
              <li><Link to="/blog" className="hover:text-accent transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/activities" className="hover:text-accent transition-colors">Activities</Link></li>
              <li><Link to="/testimonials" className="hover:text-accent transition-colors">Testimonials</Link></li>
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
            <Link to="/terms" className="hover:text-accent transition-colors">Terms</Link>
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ── Layout ─────────────────────────────────────────────────────────────────

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
