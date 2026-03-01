import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useMemo, useEffect } from "react";

// Country name → approximate [x%, y%] position on the SVG map
const COUNTRY_COORDS: Record<string, [number, number]> = {
  "USA": [18, 35], "United States": [18, 35], "US": [18, 35],
  "Canada": [18, 25], "Mexico": [20, 42],
  "Brazil": [30, 62], "Argentina": [28, 72], "Colombia": [24, 52],
  "UK": [46, 28], "United Kingdom": [46, 28], "England": [46, 28],
  "France": [48, 32], "Germany": [50, 28], "Spain": [46, 35],
  "Italy": [51, 34], "Netherlands": [49, 27], "Switzerland": [50, 31],
  "Norway": [50, 22], "Sweden": [52, 22], "Denmark": [50, 25],
  "Poland": [53, 27], "Austria": [51, 30], "Belgium": [48, 28],
  "Portugal": [44, 35], "Greece": [53, 36], "Czech Republic": [51, 29],
  "Russia": [60, 25], "Ukraine": [55, 29],
  "China": [75, 35], "Japan": [83, 33], "South Korea": [81, 34],
  "India": [68, 42], "Nepal": [70, 38],
  "Australia": [80, 68], "New Zealand": [88, 72],
  "South Africa": [54, 68], "Nigeria": [50, 52], "Kenya": [57, 55],
  "Egypt": [55, 40], "Morocco": [46, 38],
  "UAE": [62, 42], "Saudi Arabia": [60, 42], "Israel": [57, 38],
  "Turkey": [56, 34], "Iran": [63, 38],
  "Thailand": [75, 46], "Vietnam": [77, 46], "Singapore": [77, 53],
  "Malaysia": [76, 51], "Indonesia": [78, 56], "Philippines": [81, 47],
  "Pakistan": [66, 38], "Bangladesh": [72, 41],
  "Chile": [25, 68], "Peru": [24, 58],
};

function getCoords(country: string): [number, number] | null {
  if (!country) return null;
  const trimmed = country.trim();
  if (COUNTRY_COORDS[trimmed]) return COUNTRY_COORDS[trimmed];
  const key = Object.keys(COUNTRY_COORDS).find(k =>
    k.toLowerCase() === trimmed.toLowerCase() ||
    trimmed.toLowerCase().includes(k.toLowerCase())
  );
  return key ? COUNTRY_COORDS[key] : null;
}

export default function Testimonials() {
  const { data: items, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const response = await api.get("/api/testimonials");
      return response.data;
    },
  });

  // ✅ Load Elfsight script once when component mounts
  useEffect(() => {
    // Check if script is already added to avoid duplicates
    const existing = document.querySelector('script[src="https://elfsightcdn.com/platform.js"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://elfsightcdn.com/platform.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const pins = useMemo(() => {
    if (!items) return [];
    const seen = new Set<string>();
    const result: { country: string; x: number; y: number; name: string }[] = [];
    items.forEach((t: any) => {
      if (!t.country) return;
      const coords = getCoords(t.country);
      if (!coords) return;
      const key = t.country.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ country: t.country.trim(), x: coords[0], y: coords[1], name: t.name });
      }
    });
    return result;
  }, [items]);

  const totalCountries = pins.length;
  const totalReviews = items?.length ?? 0;
  const avgRating = useMemo(() => {
    if (!items || items.length === 0) return 0;
    return (items.reduce((sum: number, t: any) => sum + (t.rating || 0), 0) / items.length).toFixed(1);
  }, [items]);

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@300;400;500;600&display=swap');

        .testi-container { font-family: 'Outfit', sans-serif; }
        .testi-title { font-family: 'Playfair Display', serif; }

        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(2.8); opacity: 0; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes pulse-ring2 {
          0%   { transform: scale(1);   opacity: 0.5; }
          70%  { transform: scale(2);   opacity: 0; }
          100% { transform: scale(2);   opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }

        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .spin-slow { animation: spin-slow 60s linear infinite; }
        .float-anim { animation: float 4s ease-in-out infinite; }

        .pin-pulse::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: currentColor;
          animation: pulse-ring 2s ease-out infinite;
        }
        .pin-pulse::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: currentColor;
          animation: pulse-ring2 2s ease-out 0.4s infinite;
        }

        .pin-tooltip {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s, transform 0.2s;
          transform: translateX(-50%) translateY(4px);
        }
        .pin-wrapper:hover .pin-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0px);
        }

        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15);
        }
      `}</style>

      <div className="min-h-screen testi-container bg-gradient-to-b from-slate-50 to-white">

        {/* ══════════════ HERO ══════════════ */}
        <section className="relative overflow-hidden pt-28 pb-0" style={{ minHeight: "580px" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900" />

          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width:  i % 5 === 0 ? 2 : 1,
                height: i % 5 === 0 ? 2 : 1,
                top:  `${(i * 37 + 11) % 85}%`,
                left: `${(i * 53 + 7)  % 100}%`,
                opacity: 0.15 + (i % 4) * 0.12,
              }}
            />
          ))}

          <div className="absolute top-16 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl" />

          <div className="relative z-10 container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

              <div className="text-white animate-fade-in-up pt-4" style={{ animationDelay: "0.1s" }}>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-300 font-semibold mb-3">
                  Trekkers from around the world
                </p>
                <h1 className="testi-title text-6xl md:text-7xl leading-tight mb-6">
                  Stories of<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-400">
                    Adventure
                  </span>
                </h1>
                <p className="text-blue-200 text-lg font-light max-w-md leading-relaxed">
                  Hundreds of trekkers from across the globe have trusted Gele Trekking with their Himalayan dreams.
                </p>

                <div className="mt-8 flex gap-8">
                  {[
                    { value: totalReviews || "100+", label: "Happy Trekkers" },
                    { value: totalCountries || "30+",  label: "Countries" },
                    { value: avgRating || "5.0",       label: "Avg Rating ★" },
                  ].map((stat, i) => (
                    <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                      <div className="text-3xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-blue-300 uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative float-anim" style={{ animationDelay: "0.5s" }}>
                <div
                  className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                  style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(4px)" }}
                >
                  <svg viewBox="0 0 1000 500" className="w-full" style={{ display: "block" }}>
                    <defs>
                      <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect width="1000" height="500" fill="#0f172a" />
                    <ellipse cx="500" cy="250" rx="480" ry="240" fill="url(#globeGlow)" />
                    {[0,1,2,3,4,5,6].map(i => (
                      <line key={`h${i}`} x1="20" y1={83*i+10} x2="980" y2={83*i+10} stroke="#1e3a5f" strokeWidth="0.5" />
                    ))}
                    {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
                      <line key={`v${i}`} x1={83*i+18} y1="10" x2={83*i+18} y2="490" stroke="#1e3a5f" strokeWidth="0.5" />
                    ))}
                    <path d="M80,60 L220,60 L250,80 L270,130 L240,180 L200,220 L170,240 L140,220 L100,200 L70,160 L60,120 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <path d="M170,240 L200,220 L210,260 L190,280 L170,270 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <path d="M190,280 L240,270 L270,300 L280,360 L260,420 L230,450 L200,430 L180,380 L175,320 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <path d="M420,60 L500,55 L520,80 L510,120 L480,140 L450,130 L430,100 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <path d="M460,30 L500,25 L510,55 L490,60 L465,55 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <path d="M430,140 L510,130 L540,160 L550,220 L540,300 L510,360 L480,380 L450,360 L430,300 L420,220 L420,160 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <path d="M510,30 L750,20 L800,60 L780,100 L700,110 L600,100 L530,80 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <path d="M530,120 L600,115 L620,150 L590,170 L550,165 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <path d="M600,110 L700,105 L720,150 L700,200 L660,210 L630,185 L610,155 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <path d="M700,140 L780,130 L800,170 L770,200 L730,195 L710,170 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <path d="M700,100 L800,90 L840,120 L820,160 L780,170 L730,155 L710,130 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <path d="M830,110 L850,105 L860,130 L845,140 L830,130 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <path d="M760,310 L870,300 L900,340 L890,390 L840,410 L780,400 L750,370 L745,340 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <path d="M260,20 L330,15 L350,40 L330,60 L290,65 L260,45 Z" fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1" />
                    <line x1="20" y1="250" x2="980" y2="250" stroke="#1d4ed8" strokeWidth="0.8" strokeDasharray="6,4" opacity="0.4" />
                  </svg>

                  <div className="absolute inset-0">
                    {pins.map((pin, i) => (
                      <div
                        key={i}
                        className="pin-wrapper absolute"
                        style={{
                          left: `${pin.x}%`,
                          top:  `${pin.y}%`,
                          transform: "translate(-50%, -50%)",
                          animationDelay: `${i * 0.3}s`,
                        }}
                      >
                        <div className="absolute rounded-full bg-amber-400" style={{ width: 10, height: 10, top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: `pulse-ring 2s ease-out ${i * 0.3}s infinite` }} />
                        <div className="absolute rounded-full bg-amber-300" style={{ width: 10, height: 10, top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: `pulse-ring2 2s ease-out ${i * 0.3 + 0.4}s infinite` }} />
                        <div className="relative w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 border border-amber-200 z-10" />
                        <div className="pin-tooltip absolute bottom-full left-1/2 mb-2 z-20">
                          <div className="text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap" style={{ background: "rgba(15,23,42,0.9)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                            📍 {pin.country}
                          </div>
                        </div>
                      </div>
                    ))}

                    {pins.length === 0 && !isLoading && [
                      { country: "USA",       x: 18, y: 35 },
                      { country: "UK",        x: 46, y: 28 },
                      { country: "Australia", x: 80, y: 68 },
                      { country: "India",     x: 68, y: 42 },
                      { country: "Germany",   x: 50, y: 28 },
                      { country: "Japan",     x: 83, y: 33 },
                    ].map((pin, i) => (
                      <div key={i} className="pin-wrapper absolute" style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%,-50%)" }}>
                        <div className="absolute rounded-full bg-amber-400" style={{ width: 10, height: 10, top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: `pulse-ring 2s ease-out ${i * 0.3}s infinite` }} />
                        <div className="relative w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 border border-amber-200 z-10" />
                        <div className="pin-tooltip absolute bottom-full left-1/2 mb-2 z-20">
                          <div className="text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap" style={{ background: "rgba(15,23,42,0.9)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                            📍 {pin.country}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-3 right-4 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
                    <span className="text-blue-300 text-xs">Trekker origin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-10" style={{ lineHeight: 0 }}>
            <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none" style={{ height: 60 }}>
              <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f8fafc" />
            </svg>
          </div>
        </section>

        {/* ══════════════ OUR TESTIMONIALS ══════════════ */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : items && items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((t: any) => {
                  const hasImage = t.image && typeof t.image === "string" && t.image.trim().length > 0;
                  return (
                    <div key={t._id} className="card-hover rounded-2xl shadow-md bg-white p-6">
                      <div className="flex items-center gap-4 mb-4">
                        {hasImage ? (
                          <img
                            src={t.image}
                            alt={t.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=3b82f6&color=fff&size=64&bold=true`;
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 truncate">{t.name}</div>
                          {t.country && (
                            <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                              📍 {t.country}
                            </div>
                          )}
                          <div className="text-sm text-amber-500 font-semibold mt-1">
                            {"★".repeat(Math.min(5, Math.max(0, t.rating)))}
                            {"☆".repeat(Math.max(0, 5 - t.rating))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed line-clamp-4 text-sm">
                        {t.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-12">
                <div className="max-w-md mx-auto">
                  <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  <p className="text-xl font-semibold text-gray-900">No testimonials yet</p>
                  <p className="text-sm mt-2 text-gray-500">Be the first to share your trekking experience!</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════ GOOGLE REVIEWS (Elfsight) ══════════════ */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-500 font-semibold mb-2">
              Verified Reviews
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              What Google Says
            </h2>
            <p className="text-gray-500 text-sm mb-10">
              Real reviews from our trekkers on Google.
            </p>

            {/* ✅ Elfsight widget renders here */}
            <div
              className="elfsight-app-e481a5e4-3a7c-4fdf-8c76-96e38154fd89"
              data-elfsight-app-lazy
            />
          </div>
        </section>

      </div>
    </Layout>
  );
}
