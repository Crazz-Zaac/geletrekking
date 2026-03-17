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
  Easy:     "var(--color-success, #22c55e)",
  Moderate: "var(--color-warning, #f59e0b)",
  Hard:     "var(--color-destructive, #ef4444)",
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
      <style>{`
        .trek-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .trek-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.10) !important;
        }
        .trek-card:hover .card-img {
          transform: scale(1.05);
        }
        .card-img {
          transition: transform 0.5s ease;
        }
        .filter-pill {
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
          cursor: pointer;
        }
      `}</style>

      <div className="bg-background min-h-screen">

        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="border-b border-border pt-24 pb-7 px-6 md:px-10">
          <div className="max-w-6xl mx-auto">
            <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-2.5">
              ✦ Gele Trekking · Nepal
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
                Explore Our{" "}
                <em className="font-normal not-italic text-primary">Destinations</em>
              </h1>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Carefully curated trek packages — from gentle valleys to challenging summits across Nepal.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex gap-9 mt-7 pt-5 border-t border-border">
              {[
                { value: filteredTreks.length || "20+", label: "Destinations" },
                { value: "3",           label: "Difficulty Levels" },
                { value: "Year Round",  label: "Season" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FILTERS ───────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mr-1">
              Filter:
            </span>

            {/* Difficulty pills */}
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level}
                className="filter-pill px-4 py-1.5 text-xs font-semibold uppercase tracking-wide border border-border rounded-none"
                onClick={() => setSelectedDifficulty(selectedDifficulty === level ? "" : level)}
                style={{
                  background: selectedDifficulty === level ? "var(--color-foreground)" : "var(--color-background)",
                  color:      selectedDifficulty === level ? "var(--color-background)" : "var(--color-muted-foreground)",
                }}
              >
                {level}
              </button>
            ))}

            <div className="w-px h-5 bg-border mx-1" />

            {/* Duration pills */}
            {DURATIONS.map((d) => (
              <button
                key={d}
                className="filter-pill px-4 py-1.5 text-xs font-semibold uppercase tracking-wide border border-border rounded-none"
                onClick={() => setSelectedDuration(selectedDuration === String(d) ? "" : String(d))}
                style={{
                  background: selectedDuration === String(d) ? "var(--color-foreground)" : "var(--color-background)",
                  color:      selectedDuration === String(d) ? "var(--color-background)" : "var(--color-muted-foreground)",
                }}
              >
                {d} Days
              </button>
            ))}

            <div className="w-px h-5 bg-border mx-1" />

            {/* Rating select */}
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide border border-border bg-background text-muted-foreground outline-none cursor-pointer rounded-none"
              style={{
                background: selectedRating !== "All Ratings" ? "var(--color-foreground)" : undefined,
                color:      selectedRating !== "All Ratings" ? "var(--color-background)" : undefined,
              }}
            >
              {RATING_RANGES.map((r) => (
                <option key={r.label} value={r.label}>{r.label}</option>
              ))}
            </select>

            {/* Clear button */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSelectedDifficulty("");
                  setSelectedDuration("");
                  setSelectedPriceRange("");
                  setSelectedRating("All Ratings");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-destructive/50 text-destructive text-xs font-semibold uppercase tracking-wide rounded-none bg-transparent cursor-pointer hover:bg-destructive/5 transition-colors"
              >
                <X size={11} /> Clear
              </button>
            )}

            <span className="ml-auto text-xs text-muted-foreground">
              {filteredTreks.length} {filteredTreks.length === 1 ? "destination" : "destinations"}
            </span>
          </div>
        </div>

        {/* ── TREK CARDS ────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 md:px-10 pb-20">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-9 h-9 rounded-full border-2 border-border border-t-foreground animate-spin" />
            </div>
          ) : filteredTreks.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🏔️</div>
              <p className="text-2xl font-bold text-foreground mb-2">No treks match your filters.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
              {filteredTreks.map((trek) => (
                <Link
                  key={trek._id}
                  to={`/destination/${trek._id}`}
                  className="trek-card block bg-card overflow-hidden text-inherit no-underline"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-muted">
                    {trek.image_url ? (
                      <img
                        src={trek.image_url}
                        alt={trek.name}
                        className="card-img w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl opacity-20">🏔️</span>
                      </div>
                    )}

                    {/* Difficulty badge */}
                    <div
                      className="absolute top-3 left-3 bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
                      style={{ color: DIFF_COLOR[trek.difficulty] }}
                    >
                      {trek.difficulty}
                    </div>

                    {/* Rating badge */}
                    {typeof trek.rating === "number" && trek.rating > 0 && (
                      <div className="absolute top-3 right-3 bg-background px-2.5 py-1 text-xs font-bold text-foreground flex items-center gap-1">
                        <span className="text-accent">★</span> {trek.rating}
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    {/* Meta */}
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                      {trek.duration_days > 0 && `${trek.duration_days} Days`}
                      {trek.start_point && ` · ${trek.start_point}`}
                    </p>

                    {/* Name */}
                    <h2 className="text-xl font-bold text-foreground mb-3 leading-snug">
                      {trek.name}
                    </h2>

                    {/* Overview */}
                    {trek.overview && trek.overview !== "0" && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                        {trek.overview}
                      </p>
                    )}

                    {/* Best season */}
                    {trek.best_season && (
                      <p className="text-xs text-muted-foreground mb-4">
                        Best season:{" "}
                        <span className="text-foreground">{trek.best_season}</span>
                      </p>
                    )}

                    {/* Footer */}
                    <div className="pt-4 border-t border-border flex justify-end">
                      <span className="px-5 py-2 border border-foreground text-foreground text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-foreground hover:text-background transition-colors">
                        Learn More
                      </span>
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
