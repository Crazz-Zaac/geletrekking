import { Layout } from "@/components/Layout";
import { ItineraryTimeline, type ItineraryDay } from "@/components/ItineraryTimeline";
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
  { label: "Under $500", min: 0, max: 500 },
  { label: "$500 - $1000", min: 500, max: 1000 },
  { label: "$1000 - $1500", min: 1000, max: 1500 },
  { label: "Over $1500", min: 1500, max: Infinity },
];
const DURATIONS = [4, 7, 14];
const RATING_RANGES = [
  { label: "All Ratings", min: 0, max: 5 },
  { label: "4.5+ Stars", min: 4.5, max: 5 },
  { label: "4.0+ Stars", min: 4.0, max: 5 },
  { label: "3.5+ Stars", min: 3.5, max: 5 },
];

export default function Destinations() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<string>("All Ratings");

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
      {/* Header */}
      <section className="bg-gradient-to-r from-brand-dark to-brand-navy text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Explore Our Destinations</h1>
          <p className="text-lg text-gray-200">Choose from our carefully curated trek packages around the world</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-brand-accent" />
            <h3 className="font-bold text-brand-dark text-lg">Filters</h3>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="font-semibold text-brand-dark text-sm mb-2 block">Difficulty</label>
              <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold focus:outline-none focus:border-brand-accent">
                <option value="">All Difficulties</option>
                {DIFFICULTY_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold text-brand-dark text-sm mb-2 block">Duration</label>
              <select value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold focus:outline-none focus:border-brand-accent">
                <option value="">All Durations</option>
                {DURATIONS.map((d) => <option key={d} value={String(d)}>{d} Days</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold text-brand-dark text-sm mb-2 block">Price Range</label>
              <select value={selectedPriceRange} onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold focus:outline-none focus:border-brand-accent">
                <option value="">All Prices</option>
                {PRICE_RANGES.map((r) => <option key={r.label} value={r.label}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold text-brand-dark text-sm mb-2 block">Rating</label>
              <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold focus:outline-none focus:border-brand-accent">
                {RATING_RANGES.map((r) => <option key={r.label} value={r.label}>{r.label}</option>)}
              </select>
            </div>
            {hasActiveFilters && (
              <button onClick={() => { setSelectedDifficulty(""); setSelectedDuration(""); setSelectedPriceRange(""); setSelectedRating("All Ratings"); }}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-semibold h-10">
                <X className="w-4 h-4" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Trek List */}
        {isLoading ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">Loading treks...</p>
          </div>
        ) : filteredTreks.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No treks match your filters. Try adjusting your criteria.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredTreks.map((trek) => (
              <Link key={trek._id} to={`/destination/${trek._id}`}
                className="block bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  {/* Image */}
                  <div className="md:col-span-1 overflow-hidden rounded-lg">
                    {trek.image_url ? (
                      <img src={trek.image_url} alt={trek.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold text-brand-dark mb-4 group-hover:text-brand-accent transition-colors">
                      {trek.name}
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {trek.duration_days > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">Duration</div>
                          <div className="text-lg font-bold text-brand-accent">{trek.duration_days} Days</div>
                        </div>
                      )}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Difficulty</div>
                        <div className={`text-lg font-bold ${trek.difficulty === "Hard" ? "text-red-600" : trek.difficulty === "Moderate" ? "text-orange-600" : "text-green-600"}`}>
                          {trek.difficulty}
                        </div>
                      </div>
                      {trek.price_usd > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">Price</div>
                          <div className="text-lg font-bold text-brand-accent">${trek.price_usd}</div>
                        </div>
                      )}
                      {/* ✅ Fixed: only show rating if it's a number greater than 0 */}
                      {typeof trek.rating === "number" && trek.rating > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">Rating</div>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-brand-accent">{trek.rating}</span>
                            <span className="text-yellow-400">★</span>
                          </div>
                        </div>
                      )}
                      {trek.start_point && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">Start Point</div>
                          <div className="text-lg font-bold text-brand-dark">{trek.start_point}</div>
                        </div>
                      )}
                      {trek.end_point && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">End Point</div>
                          <div className="text-lg font-bold text-brand-dark">{trek.end_point}</div>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      {/* ✅ Fixed: only show overview if it's a non-empty, non-zero string */}
                      {trek.overview && trek.overview !== "0" && (
                        <p className="text-gray-700 mb-2 line-clamp-3">{trek.overview}</p>
                      )}
                      {trek.best_season && (
                        <div className="text-sm text-gray-600">
                          <strong>Best Season:</strong> {trek.best_season}
                        </div>
                      )}
                    </div>

                    <div className="text-brand-accent font-semibold group-hover:gap-2 transition-all inline-block">
                      View Details →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
