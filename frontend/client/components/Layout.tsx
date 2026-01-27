import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/apiClient";

const navigationItems = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Destinations", path: "/destinations" },
  { label: "Gallery", path: "/gallery" },
  { label: "Company Activities", path: "/activities" },
  { label: "Optional Treks", path: "/optional-treks" },
  { label: "Testimonials", path: "/testimonials" },
  { label: "Blog", path: "/blog" },
  { label: "Contact Us", path: "/contact" },
];

export const Header = ({ settings }: { settings: any }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-brand-warning rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="hidden sm:inline text-xl font-bold text-brand-dark">
              {settings?.siteName || "GELE TREKKING"}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-brand-accent",
                  location.pathname === item.path
                    ? "text-brand-accent"
                    : "text-gray-700"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

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

        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-gray-200 py-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  location.pathname === item.path
                    ? "bg-brand-accent/10 text-brand-accent"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export const Footer = ({ settings }: { settings: any }) => {
  return (
    <footer className="text-white mt-20" style={{ backgroundColor: "#26275E" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-accent to-brand-warning rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              {settings?.siteName || "GELE TREKKING"}
            </h3>
            <p className="text-gray-300 text-sm">
              Explore the world, one trail at a time. Experience breathtaking
              adventures with expert guides.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/destinations" className="hover:text-brand-accent">
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-brand-accent">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-brand-accent">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-accent">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/about" className="hover:text-brand-accent">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/activities" className="hover:text-brand-accent">
                  Activities
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="hover:text-brand-accent">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Email: {settings?.email || "info@geletrekking.com"}</li>
              <li>Phone: {settings?.phone || "+977-XXXXXXXX"}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
          <p>
            &copy; {new Date().getFullYear()} {settings?.siteName || "GELE TREKKING"}. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-brand-accent">
              Terms
            </a>
            <a href="#" className="hover:text-brand-accent">
              Privacy
            </a>
            <a href="#" className="hover:text-brand-accent">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

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
