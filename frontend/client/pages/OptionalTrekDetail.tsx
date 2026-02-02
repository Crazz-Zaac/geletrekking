import { Layout } from "@/components/Layout";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { ArrowLeft, Calendar, TrendingUp, MapPin, Users, Star } from "lucide-react";
import { ItineraryTimeline } from "@/components/ItineraryTimeline";

export default function OptionalTrekDetail() {
  const { id } = useParams();

  // Fetch trek data from API
  const { data: trek, isLoading, error } = useQuery({
    queryKey: ["optional-trek", id],
    queryFn: async () => {
      const response = await api.get(`/api/treks/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Check if offer is valid
  const hasValidOffer =
    trek?.has_offer &&
    trek?.offer_valid_from &&
    trek?.offer_valid_to &&
    new Date() >= new Date(trek.offer_valid_from) &&
    new Date() <= new Date(trek.offer_valid_to);

  const currentPriceUSD =
    hasValidOffer && trek?.discounted_price_usd
      ? trek.discounted_price_usd
      : trek?.price_usd;

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 pt-28 pb-12 max-w-5xl">
          {/* Back Button */}
          <Link
            to="/optional-treks"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <ArrowLeft size={18} /> Back to Optional Activities
          </Link>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-8 text-center py-12">
              <div className="text-gray-600 text-lg">Loading trek details...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-8 text-center py-12">
              <div className="text-red-600 text-lg">Trek not found.</div>
              <Link
                to="/optional-treks"
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                Return to Optional Activities
              </Link>
            </div>
          )}

          {/* Trek Content */}
          {!isLoading && !error && trek && (
            <>
              {/* Header */}
              <h1 className="mt-6 text-4xl md:text-5xl font-bold text-gray-900">
                {trek.name}
              </h1>

              {/* Quick Stats */}
              <div className="mt-4 flex flex-wrap gap-4">
                {trek.duration_days > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {trek.duration_days} days
                    </span>
                  </div>
                )}

                {trek.difficulty && (
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      trek.difficulty === "Hard"
                        ? "bg-red-50"
                        : trek.difficulty === "Moderate"
                          ? "bg-orange-50"
                          : "bg-green-50"
                    }`}
                  >
                    <TrendingUp
                      size={16}
                      className={
                        trek.difficulty === "Hard"
                          ? "text-red-600"
                          : trek.difficulty === "Moderate"
                            ? "text-orange-600"
                            : "text-green-600"
                      }
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      {trek.difficulty}
                    </span>
                  </div>
                )}

                {trek.max_altitude_meters && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                    <MapPin size={16} className="text-purple-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {trek.max_altitude_meters}m
                    </span>
                  </div>
                )}

                {trek.price_usd > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg">
                    {hasValidOffer ? (
                      <>
                        <span className="text-sm font-semibold text-gray-400 line-through">
                          ${trek.price_usd}
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          ${trek.discounted_price_usd}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">
                        ${trek.price_usd}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Special Offer Banner */}
              {hasValidOffer && (
                <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🎉</span>
                    <h3 className="text-2xl font-bold">{trek.offer_title}</h3>
                  </div>
                  <p className="text-lg opacity-90">{trek.offer_description}</p>
                  <div className="mt-2 text-sm">
                    Valid until: {new Date(trek.offer_valid_to).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Featured Image */}
              {trek.image_url && (
                <div className="mt-8 rounded-3xl overflow-hidden bg-gray-100 shadow-xl">
                  <img
                    src={trek.image_url}
                    alt={trek.name}
                    className="w-full h-[420px] object-cover"
                  />
                </div>
              )}

              {/* Main Content Grid */}
              <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Overview */}
                  <div className="rounded-3xl bg-white shadow-lg p-7">
                    <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                    <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
                      {trek.overview || "No description available"}
                    </p>
                  </div>

                  {/* Highlights */}
                  {trek.highlights && trek.highlights.length > 0 && (
                    <div className="rounded-3xl bg-white shadow-lg p-7">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Star className="text-yellow-500" size={20} />
                        Highlights
                      </h3>
                      <ul className="mt-4 space-y-2">
                        {trek.highlights.map((highlight: string, idx: number) => (
                          <li key={idx} className="flex gap-3 text-gray-700">
                            <span className="text-blue-600 font-bold">★</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Itinerary */}
                  {trek.itinerary && trek.itinerary.length > 0 && (
                    <div className="rounded-3xl bg-white shadow-lg p-7">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Day-by-Day Itinerary
                      </h2>
                      <ItineraryTimeline
                        days={trek.itinerary}
                        totalDays={trek.duration_days}
                      />
                    </div>
                  )}

                  {/* FAQs */}
                  {trek.faqs && trek.faqs.length > 0 && (
                    <div className="rounded-3xl bg-white shadow-lg p-7">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Frequently Asked Questions
                      </h2>
                      <div className="space-y-6">
                        {trek.faqs.map((faq: any, idx: number) => (
                          <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              {faq.question}
                            </h3>
                            <p className="text-gray-700">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extra Sections */}
                  {trek.extra_sections && trek.extra_sections.length > 0 && (
                    <>
                      {trek.extra_sections.map((section: any, idx: number) => (
                        <div key={idx} className="rounded-3xl bg-white shadow-lg p-7">
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {section.title}
                          </h2>
                          <p className="text-gray-700 whitespace-pre-line">
                            {section.content}
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                  {/* Trek Details */}
                  <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-teal-50 p-7 shadow-lg">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Trek Details</h2>

                    {trek.start_point && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 font-semibold">Start Point</div>
                        <div className="text-gray-900 font-medium">{trek.start_point}</div>
                      </div>
                    )}

                    {trek.end_point && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 font-semibold">End Point</div>
                        <div className="text-gray-900 font-medium">{trek.end_point}</div>
                      </div>
                    )}

                    {trek.best_season && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 font-semibold">Best Season</div>
                        <div className="text-gray-900 font-medium">{trek.best_season}</div>
                      </div>
                    )}

                    {(trek.group_size_min || trek.group_size_max) && (
                      <div>
                        <div className="text-sm text-gray-600 font-semibold">Group Size</div>
                        <div className="text-gray-900 font-medium flex items-center gap-2">
                          <Users size={16} />
                          {trek.group_size_min} - {trek.group_size_max} people
                        </div>
                      </div>
                    )}
                  </div>

                  {/* What's Included */}
                  {trek.includes && trek.includes.length > 0 && (
                    <div className="rounded-3xl bg-white shadow-lg p-7">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        What's Included
                      </h2>
                      <ul className="space-y-2">
                        {trek.includes.map((item: string, idx: number) => (
                          <li key={idx} className="flex gap-2 text-gray-700 text-sm">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What's Not Included */}
                  {trek.excludes && trek.excludes.length > 0 && (
                    <div className="rounded-3xl bg-white shadow-lg p-7">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Not Included</h2>
                      <ul className="space-y-2">
                        {trek.excludes.map((item: string, idx: number) => (
                          <li key={idx} className="flex gap-2 text-gray-600 text-sm">
                            <span className="text-gray-400 font-bold">✗</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>

              {/* CTA Section */}
              <div className="mt-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-8 text-center text-white shadow-xl">
                <h3 className="text-3xl font-bold mb-4">Ready to Join This Adventure?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Book your spot on this amazing trek today!
                </p>
                <a
                  href={`mailto:info@geletrekking.com?subject=Trek Inquiry: ${trek.name}`}
                  className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Book Now
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
