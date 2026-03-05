import { Layout } from "@/components/Layout";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

interface TrekPackage {
  _id: string;
  name: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  duration_days: number;
  price_usd: number;
  price_gbp: number;
  overview: string;
  best_season: string;
  image_url?: string;
  rating?: number;
  start_point?: string;
  end_point?: string;
  is_featured?: boolean;
  is_active?: boolean;
}

const DIFFICULTY_LEVELS: ("Easy" | "Moderate" | "Hard")[] = ["Easy", "Moderate", "Hard"];
const PRICE_RANGES = [
  { label: "Under $500",    min: 0,    max: 500      },
  { label: "$500 - $1000",  min: 500,  max: 1000     },
  { label: "$1000 - $1500", min: 1000, max: 1500     },
  { label: "Over $1500",    min: 1500, max: Infinity  },
];
const DURATIONS = [4, 7, 14];
const RATING_RANGES = [
  { label: "All Ratings", min: 0,   max: 5 },
  { label: "4.5+ Stars",  min: 4.5, max: 5 },
  { label: "4.0+ Stars",  min: 4.0, max: 5 },
  { label: "3.5+ Stars",  min: 3.5, max: 5 },
];

// ── Gift ribbon bow decoration ──────────────────────────────────
function RibbonBow() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 90,
        height: 90,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {/* diagonal band */}
      <div
        style={{
          position: "absolute",
          width: 128,
          height: 22,
          top: 26,
          left: -26,
          transform: "rotate(-45deg)",
          transformOrigin: "center center",
          background: "#7f1d1d",
          borderTop: "1.5px solid #fbbf24",
          borderBottom: "1.5px solid #fbbf24",
          boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        }}
      />
      {/* bow SVG — rotated to align with band */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          width: 42,
          height: 42,
          transform: "rotate(-45deg)",
          transformOrigin: "center center",
        }}
      >
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* left loop */}
          <path d="M32 32 C20 18 4 10 8 4 C12 -2 26 14 32 32Z" fill="#7f1d1d" stroke="#fbbf24" strokeWidth="1.2" />
          {/* right loop */}
          <path d="M32 32 C44 18 60 10 56 4 C52 -2 38 14 32 32Z" fill="#7f1d1d" stroke="#fbbf24" strokeWidth="1.2" />
          {/* bottom-left tail */}
          <path d="M32 32 C20 46 4 54 2 60 C8 62 22 50 32 32Z" fill="#6b1818" stroke="#fbbf24" strokeWidth="1" />
          {/* bottom-right tail */}
          <path d="M32 32 C44 46 60 54 62 60 C56 62 42 50 32 32Z" fill="#6b1818" stroke="#fbbf24" strokeWidth="1" />
          {/* knot layers */}
          <ellipse cx="32" cy="32" rx="9" ry="7" fill="#450a0a" />
          <ellipse cx="32" cy="31" rx="6" ry="4.5" fill="#fbbf24" />
          <ellipse cx="32" cy="31" rx="3" ry="2.5" fill="#7f1d1d" />
        </svg>
      </div>
    </div>
  );
}

export default function Destinations() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedDuration,   setSelectedDuration]   = useState<string>("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [selectedRating,     setSelectedRating]     = useState<string>("All Ratings");

  const { data: treks, isLoading } = useQuery({
    queryKey: ["treks"],
    queryFn: async () => {
      const response = await api.get("/api/treks");
      return response.data as TrekPackage[];
    },
  });

  const filteredTreks = (treks || []).filter((trek) => {
    if (!trek.is_active) return false;
    if (selectedDifficulty && trek.difficulty !== selectedDifficulty) return false;
    if (selectedDuration && trek.duration_days !== parseInt(selectedDuration)) return false;
    if (selectedPriceRange) {
      const range = PRICE_RANGES.find((r) => r.label === selectedPriceRange);
      if (range && (trek.price_usd < range.min || trek.price_usd > range.max)) return false;
    }
    if (selectedRating !== "All Ratings" && trek.rating) {
      const ratingRange = RATING_RANGES.find((r) => r.label === selectedRating);
      if (ratingRange && (trek.rating < ratingRange.min || trek.rating > ratingRange.max)) return false;
    }
    return true;
  });

  const hasActiveFilters =
    selectedDifficulty || selectedDuration || selectedPriceRange || selectedRating !== "All Ratings";

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: "#0f172a" }}>

        {/* ══════════════ HERO ══════════════ */}
        <section
          className="relative overflow-hidden pt-32 pb-20"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f4c3a 100%)",
            minHeight: "420px",
          }}
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width:  i % 5 === 0 ? 2 : 1,
                height: i % 5 === 0 ? 2 : 1,
                top:  `${(i * 37 + 11) % 90}%`,
                left: `${(i * 53 + 7)  % 100}%`,
                opacity: 0.15 + (i % 4) * 0.15,
              }}
            />
          ))}

          <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full blur-3xl"
            style={{ background: "rgba(13,148,136,0.12)" }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl"
            style={{ background: "rgba(15,76,58,0.2)" }} />
          <div className="absolute top-20 right-10 w-48 h-48 rounded-full blur-3xl"
            style={{ background: "rgba(251,191,36,0.06)" }} />

          <div className="relative z-10 container mx-auto px-6 text-center">
            <p className="text-xs uppercase tracking-[0.35em] font-semibold mb-4"
              style={{ color: "#5eead4" }}>
              ✦ Gele Trekking
            </p>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Explore Our{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #fbbf24, #f97316)" }}
              >
                Destinations
              </span>
            </h1>
            <p className="text-lg font-light max-w-xl mx-auto mb-10"
              style={{ color: "#94a3b8" }}>
              Choose from our carefully curated trek packages — from gentle valleys to challenging summits.
            </p>

            <div className="flex justify-center gap-10 flex-wrap">
              {[
                { value: filteredTreks.length || "20+", label: "Destinations" },
                { value: "3",                            label: "Difficulty Levels" },
                { value: "Year",                         label: "Round Season" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black" style={{ color: "#fbbf24" }}>{stat.value}</div>
                  <div className="text-xs uppercase tracking-widest mt-1" style={{ color: "#64748b" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
            <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none" style={{ height: 50 }}>
              <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#0f172a" />
            </svg>
          </div>
        </section>

        {/* ══════════════ FILTERS ══════════════ */}
        <div className="container mx-auto px-4 py-10">
          <div
            className="rounded-2xl p-6 mb-8"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Filter className="w-5 h-5" style={{ color: "#5eead4" }} />
              <h3 className="font-bold text-lg text-white">Filters</h3>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider mb-2 font-semibold"
                  style={{ color: "#64748b" }}>Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                >
                  <option value="" style={{ background: "#1e293b" }}>All Difficulties</option>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <option key={level} value={level} style={{ background: "#1e293b" }}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-2 font-semibold"
                  style={{ color: "#64748b" }}>Duration</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                >
                  <option value="" style={{ background: "#1e293b" }}>All Durations</option>
                  {DURATIONS.map((d) => (
                    <option key={d} value={String(d)} style={{ background: "#1e293b" }}>{d} Days</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-2 font-semibold"
                  style={{ color: "#64748b" }}>Price Range</label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                >
                  <option value="" style={{ background: "#1e293b" }}>All Prices</option>
                  {PRICE_RANGES.map((r) => (
                    <option key={r.label} value={r.label} style={{ background: "#1e293b" }}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-2 font-semibold"
                  style={{ color: "#64748b" }}>Rating</label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                >
                  {RATING_RANGES.map((r) => (
                    <option key={r.label} value={r.label} style={{ background: "#1e293b" }}>{r.label}</option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSelectedDifficulty("");
                    setSelectedDuration("");
                    setSelectedPriceRange("");
                    setSelectedRating("All Ratings");
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}
                >
                  <X className="w-4 h-4" /> Clear All
                </button>
              )}
            </div>
          </div>

          {/* ══════════════ TREK LIST ══════════════ */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div
                className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: "#0d9488", borderTopColor: "transparent" }}
              />
            </div>
          ) : filteredTreks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">🏔️</div>
              <p className="text-lg font-semibold mb-2" style={{ color: "#e2e8f0" }}>No treks match your filters.</p>
              <p className="text-sm" style={{ color: "#64748b" }}>Try adjusting your criteria.</p>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm" style={{ color: "#64748b" }}>
                Showing{" "}
                <span style={{ color: "#5eead4" }} className="font-semibold">{filteredTreks.length}</span>{" "}
                {filteredTreks.length === 1 ? "destination" : "destinations"}
              </p>

              <div className="space-y-6">
                {filteredTreks.map((trek) => (
                  <Link
                    key={trek._id}
                    to={`/destination/${trek._id}`}
                    className="block rounded-2xl overflow-hidden transition-all duration-300 group"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.border = "1px solid rgba(13,148,136,0.4)";
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(13,148,136,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.border = "1px solid rgba(255,255,255,0.08)";
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0">

                      {/* ── Image with ribbon bow ── */}
                      <div
                        className="md:col-span-1 h-64 overflow-hidden relative"
                        style={{ background: "linear-gradient(135deg,#1e3a5f,#0f4c3a)" }}
                      >
                        {trek.image_url ? (
                          <img
                            src={trek.image_url}
                            alt={trek.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl opacity-20">🏔️</span>
                          </div>
                        )}
                        {/* 🎁 Ribbon bow */}
                        <RibbonBow />
                      </div>

                      {/* Info */}
                      <div className="md:col-span-2 p-6 flex flex-col justify-between">
                        <div>
                          <h2 className="text-2xl font-black mb-4 transition-colors" style={{ color: "#f1f5f9" }}>
                            {trek.name}
                          </h2>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                            {trek.duration_days > 0 && (
                              <div className="rounded-xl p-3"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div className="text-xs mb-1" style={{ color: "#64748b" }}>Duration</div>
                                <div className="text-base font-bold" style={{ color: "#5eead4" }}>{trek.duration_days} Days</div>
                              </div>
                            )}
                            <div className="rounded-xl p-3"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                              <div className="text-xs mb-1" style={{ color: "#64748b" }}>Difficulty</div>
                              <div className="text-base font-bold"
                                style={{
                                  color: trek.difficulty === "Hard" ? "#fca5a5"
                                    : trek.difficulty === "Moderate" ? "#fdba74"
                                    : "#86efac",
                                }}>
                                {trek.difficulty}
                              </div>
                            </div>
                            {trek.price_usd > 0 && (
                              <div className="rounded-xl p-3"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div className="text-xs mb-1" style={{ color: "#64748b" }}>Price</div>
                                <div className="text-base font-bold" style={{ color: "#fbbf24" }}>${trek.price_usd}</div>
                              </div>
                            )}
                            {typeof trek.rating === "number" && trek.rating > 0 && (
                              <div className="rounded-xl p-3"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div className="text-xs mb-1" style={{ color: "#64748b" }}>Rating</div>
                                <div className="flex items-center gap-1">
                                  <span className="text-base font-bold" style={{ color: "#fbbf24" }}>{trek.rating}</span>
                                  <span style={{ color: "#fbbf24" }}>★</span>
                                </div>
                              </div>
                            )}
                            {trek.start_point && (
                              <div className="rounded-xl p-3"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div className="text-xs mb-1" style={{ color: "#64748b" }}>Start Point</div>
                                <div className="text-base font-bold" style={{ color: "#e2e8f0" }}>{trek.start_point}</div>
                              </div>
                            )}
                            {trek.end_point && (
                              <div className="rounded-xl p-3"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div className="text-xs mb-1" style={{ color: "#64748b" }}>End Point</div>
                                <div className="text-base font-bold" style={{ color: "#e2e8f0" }}>{trek.end_point}</div>
                              </div>
                            )}
                          </div>

                          {trek.overview && trek.overview !== "0" && (
                            <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: "#94a3b8" }}>
                              {trek.overview}
                            </p>
                          )}
                          {trek.best_season && (
                            <p className="text-xs" style={{ color: "#64748b" }}>
                              <span className="font-semibold" style={{ color: "#5eead4" }}>Best Season: </span>
                              {trek.best_season}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <span className="text-sm font-bold transition-colors" style={{ color: "#5eead4" }}>
                            View Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
