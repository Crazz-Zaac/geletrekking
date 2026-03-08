import { Layout } from "@/components/Layout";
import { useState } from "react";
import { X } from "lucide-react";
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

const DIFF_COLOR: Record<string, string> = {
  Easy:     "#22c55e",
  Moderate: "#f59e0b",
  Hard:     "#ef4444",
};

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
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600&display=swap');

        .trek-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .trek-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.13) !important;
        }
        .trek-card:hover .card-image img {
          transform: scale(1.05);
        }
        .card-image img {
          transition: transform 0.5s ease;
        }
        .learn-btn {
          transition: background 0.2s ease, color 0.2s ease;
        }
        .learn-btn:hover {
          background: #111 !important;
          color: #fff !important;
        }
        .filter-pill {
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
          cursor: pointer;
          border: none;
          font-family: 'Inter', sans-serif;
        }
        .filter-pill:hover {
          background: #f0ede8 !important;
        }
        .filter-pill.active {
          background: #111 !important;
          color: #fff !important;
        }
      `}</style>

      <div style={{ background: "#faf8f5", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

        {/* ══════════════ HERO ══════════════ */}
        <section style={{ borderBottom: "1px solid #e8e2d8", padding: "100px 40px 28px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "#a0856a",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}>
              ✦ Gele Trekking · Nepal
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(36px, 5vw, 52px)",
                fontWeight: 900,
                color: "#111",
                margin: 0,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}>
                Explore Our{" "}
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>Destinations</em>
              </h1>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: "#888",
                maxWidth: 280,
                lineHeight: 1.65,
                margin: 0,
              }}>
                Carefully curated trek packages — from gentle valleys to challenging summits across Nepal.
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 36, marginTop: 28, paddingTop: 20, borderTop: "1px solid #e8e2d8" }}>
              {[
                { value: filteredTreks.length || "20+", label: "Destinations" },
                { value: "3",   label: "Difficulty Levels" },
                { value: "Year Round", label: "Season" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#111" }}>{s.value}</div>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ FILTERS ══════════════ */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb", marginRight: 4 }}>Filter:</span>

            {/* Difficulty pills */}
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level}
                className={`filter-pill ${selectedDifficulty === level ? "active" : ""}`}
                onClick={() => setSelectedDifficulty(selectedDifficulty === level ? "" : level)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  background: selectedDifficulty === level ? "#111" : "#fff",
                  color: selectedDifficulty === level ? "#fff" : "#555",
                  border: "1px solid #ddd",
                }}
              >
                {level}
              </button>
            ))}

            <div style={{ width: 1, height: 24, background: "#ddd", margin: "0 4px" }} />

            {/* Duration pills */}
            {DURATIONS.map((d) => (
              <button
                key={d}
                className={`filter-pill ${selectedDuration === String(d) ? "active" : ""}`}
                onClick={() => setSelectedDuration(selectedDuration === String(d) ? "" : String(d))}
                style={{
                  padding: "7px 18px",
                  borderRadius: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  background: selectedDuration === String(d) ? "#111" : "#fff",
                  color: selectedDuration === String(d) ? "#fff" : "#555",
                  border: "1px solid #ddd",
                }}
              >
                {d} Days
              </button>
            ))}

            <div style={{ width: 1, height: 24, background: "#ddd", margin: "0 4px" }} />

            {/* Rating select */}
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              style={{
                padding: "7px 14px",
                border: "1px solid #ddd",
                borderRadius: 0,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                background: selectedRating !== "All Ratings" ? "#111" : "#fff",
                color: selectedRating !== "All Ratings" ? "#fff" : "#555",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {RATING_RANGES.map((r) => (
                <option key={r.label} value={r.label}>{r.label}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSelectedDifficulty("");
                  setSelectedDuration("");
                  setSelectedPriceRange("");
                  setSelectedRating("All Ratings");
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px",
                  border: "1px solid #fca5a5",
                  borderRadius: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  background: "transparent",
                  color: "#ef4444",
                  cursor: "pointer",
                }}
              >
                <X size={12} /> Clear
              </button>
            )}

            <span style={{ marginLeft: "auto", fontSize: 12, color: "#aaa" }}>
              {filteredTreks.length} {filteredTreks.length === 1 ? "destination" : "destinations"}
            </span>
          </div>
        </div>

        {/* ══════════════ TREK CARDS ══════════════ */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 80px" }}>

          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "3px solid #e8e2d8", borderTopColor: "#111",
                animation: "spin 0.8s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filteredTreks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏔️</div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#111", marginBottom: 8 }}>No treks match your filters.</p>
              <p style={{ fontSize: 14, color: "#aaa" }}>Try adjusting your criteria.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
              {filteredTreks.map((trek) => (
                <Link
                  key={trek._id}
                  to={`/destination/${trek._id}`}
                  className="trek-card"
                  style={{
                    display: "block",
                    background: "#fff",
                    border: "1px solid #e8e2d8",
                    overflow: "hidden",
                    textDecoration: "none",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Image */}
                  <div
                    className="card-image"
                    style={{
                      height: 220,
                      overflow: "hidden",
                      position: "relative",
                      background: "#e8e2d8",
                    }}
                  >
                    {trek.image_url ? (
                      <img
                        src={trek.image_url}
                        alt={trek.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 48, opacity: 0.2 }}>🏔️</span>
                      </div>
                    )}

                    {/* Difficulty badge */}
                    <div style={{
                      position: "absolute", top: 14, left: 14,
                      background: "#fff",
                      padding: "4px 12px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: DIFF_COLOR[trek.difficulty],
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      {trek.difficulty}
                    </div>

                    {/* Rating badge */}
                    {typeof trek.rating === "number" && trek.rating > 0 && (
                      <div style={{
                        position: "absolute", top: 14, right: 14,
                        background: "#fff",
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#111",
                        fontFamily: "'Inter', sans-serif",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <span style={{ color: "#f59e0b" }}>★</span> {trek.rating}
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "22px 24px 24px" }}>

                    {/* Meta line */}
                    <p style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      color: "#aaa",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      margin: "0 0 8px",
                    }}>
                      {trek.duration_days > 0 && `${trek.duration_days} Days`}
                      {trek.start_point && ` · ${trek.start_point}`}
                    </p>

                    {/* Name */}
                    <h2 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#111",
                      margin: "0 0 12px",
                      lineHeight: 1.2,
                    }}>
                      {trek.name}
                    </h2>

                    {/* Overview */}
                    {trek.overview && trek.overview !== "0" && (
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        color: "#777",
                        lineHeight: 1.65,
                        margin: "0 0 20px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {trek.overview}
                      </p>
                    )}

                    {/* Best season */}
                    {trek.best_season && (
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#bbb", margin: "0 0 20px" }}>
                        Best season: <span style={{ color: "#888" }}>{trek.best_season}</span>
                      </p>
                    )}

                    {/* Footer */}
                    <div style={{
                      paddingTop: 18,
                      borderTop: "1px solid #f0ede8",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}>
                      <button
                        className="learn-btn"
                        style={{
                          padding: "9px 22px",
                          border: "1px solid #111",
                          borderRadius: 0,
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          background: "transparent",
                          color: "#111",
                          cursor: "pointer",
                        }}
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
