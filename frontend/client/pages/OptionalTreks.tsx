import { Layout } from "@/components/Layout";
import { Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export default function OptionalTreks() {
  const { data: treks, isLoading } = useQuery({
    queryKey: ["optional-treks"],
    queryFn: async () => {
      const response = await api.get("/api/treks");
      return response.data;
    },
  });

  // Filter to show only optional treks that are active
  const optionalTreks = (treks || []).filter(
    (trek: any) => trek.is_optional && trek.is_active
  );

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-teal-50">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Optional Activities
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Enhance your adventure with our optional trekking activities curated by GELE TREKKING.
            </p>
          </div>
        </section>

        {/* Treks Grid Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-600 text-lg">Loading optional activities...</div>
              </div>
            ) : optionalTreks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  No optional activities available at the moment.
                </div>
                <p className="text-gray-400 text-sm">
                  Check back later or explore our main destinations.
                </p>
                <Link
                  to="/destinations"
                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Main Destinations
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8 text-gray-600">
                  Showing {optionalTreks.length} optional {optionalTreks.length === 1 ? "activity" : "activities"}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {optionalTreks.map((trek: any) => (
                    <div
                      key={trek._id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                    >
                      {/* Image */}
                      <div className="h-56 bg-gradient-to-br from-blue-100 to-teal-100 overflow-hidden">
                        {trek.image_url ? (
                          <img
                            src={trek.image_url}
                            alt={trek.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No image available</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {trek.name}
                        </h2>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {trek.overview || "Explore this amazing trekking adventure."}
                        </p>

                        {/* Trek Details */}
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          {trek.duration_days > 0 && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {trek.duration_days} {trek.duration_days === 1 ? "day" : "days"}
                            </span>
                          )}
                          
                          {trek.difficulty && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                trek.difficulty === "Hard"
                                  ? "bg-red-100 text-red-700"
                                  : trek.difficulty === "Moderate"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {trek.difficulty}
                            </span>
                          )}
                          
                          {trek.price_usd > 0 && (
                            <span className="font-bold text-blue-600">
                              ${trek.price_usd}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-5 flex items-center justify-between pt-4 border-t border-gray-100">
                          <Link
                            to={`/optional-trek/${trek._id}`}
                            className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                          >
                            View Details →
                          </Link>
                          <div className="flex items-center gap-3">
                            <button 
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Share"
                            >
                              <Share2 size={18} />
                            </button>
                            <button 
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Share on Facebook"
                            >
                              <Facebook size={18} />
                            </button>
                            <button 
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Share on Twitter"
                            >
                              <Twitter size={18} />
                            </button>
                            <button 
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Share on LinkedIn"
                            >
                              <Linkedin size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}