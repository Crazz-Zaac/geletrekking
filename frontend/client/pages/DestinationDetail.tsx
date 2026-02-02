import { Layout } from "@/components/Layout";
import { ItineraryTimeline } from "@/components/ItineraryTimeline";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2, Facebook, Linkedin, Twitter, Calendar, MapPin, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export default function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Fetch trek data from API
  const { data: trek, isLoading, error } = useQuery({
    queryKey: ["trek", id],
    queryFn: async () => {
      const response = await api.get(`/api/treks/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="text-gray-600">Loading trek details...</div>
        </div>
      </Layout>
    );
  }

  if (error || !trek) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-brand-dark mb-4">
            Trek not found
          </h1>
          <Link
            to="/destinations"
            className="text-brand-accent hover:underline flex items-center gap-2 justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Destinations
          </Link>
        </div>
      </Layout>
    );
  }

  const shareUrl = window.location.href;
  const shareText = `Check out ${trek.name} on GELE TREKKING!`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  // Check if offer is valid
  const hasValidOffer = trek.has_offer && trek.offer_valid_from && trek.offer_valid_to
    ? new Date() >= new Date(trek.offer_valid_from) && new Date() <= new Date(trek.offer_valid_to)
    : false;

  return (
    <Layout>
      {/* Back Button */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-brand-accent hover:gap-3 transition-all font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Destinations
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          {trek.image_url ? (
            <img
              src={trek.image_url}
              alt={trek.name}
              className="w-full h-96 object-cover rounded-lg mb-8 shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg mb-8 flex items-center justify-center">
              <span className="text-gray-400 text-lg">No image available</span>
            </div>
          )}

          <div className="flex items-start justify-between gap-8 flex-wrap">
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-brand-dark mb-4">
                {trek.name}
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                {trek.overview}
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 bg-brand-accent hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>

              {showShareMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
                  <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700"
                  >
                    <Facebook className="w-5 h-5" />
                    Facebook
                  </a>
                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700 border-t border-gray-200"
                  >
                    <Twitter className="w-5 h-5" />
                    Twitter
                  </a>
                  <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700 border-t border-gray-200"
                  >
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Special Offer Banner */}
        {hasValidOffer && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 mb-8 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎉</span>
              <h3 className="text-2xl font-bold">{trek.offer_title}</h3>
            </div>
            <p className="text-lg opacity-90">{trek.offer_description}</p>
            <div className="mt-3 text-sm">
              Valid until: {new Date(trek.offer_valid_to).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold mb-1">
              <Calendar className="w-4 h-4" />
              Duration
            </div>
            <div className="text-2xl font-bold text-brand-dark">
              {trek.duration_days} Days
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold mb-1">
              <TrendingUp className="w-4 h-4" />
              Difficulty
            </div>
            <div
              className={`text-2xl font-bold ${
                trek.difficulty === "Hard"
                  ? "text-red-600"
                  : trek.difficulty === "Moderate"
                    ? "text-orange-600"
                    : "text-green-600"
              }`}
            >
              {trek.difficulty}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold mb-1">
              <MapPin className="w-4 h-4" />
              Max Altitude
            </div>
            <div className="text-2xl font-bold text-brand-dark">
              {trek.max_altitude_meters ? `${trek.max_altitude_meters}m` : "N/A"}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold mb-1">
              <Users className="w-4 h-4" />
              Price
            </div>
            <div className="text-2xl font-bold text-brand-accent">
              {hasValidOffer && trek.discounted_price_usd ? (
                <div>
                  <span className="line-through text-gray-400 text-lg mr-2">
                    ${trek.price_usd}
                  </span>
                  ${trek.discounted_price_usd}
                </div>
              ) : (
                `$${trek.price_usd || 0}`
              )}
            </div>
          </div>
        </div>

        {/* Trek Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {trek.start_point && (
            <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-400">
              <div className="text-sm text-gray-600 font-semibold mb-1">Start Point</div>
              <div className="text-lg font-bold text-gray-900">{trek.start_point}</div>
            </div>
          )}

          {trek.end_point && (
            <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-400">
              <div className="text-sm text-gray-600 font-semibold mb-1">End Point</div>
              <div className="text-lg font-bold text-gray-900">{trek.end_point}</div>
            </div>
          )}

          {trek.best_season && (
            <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-400">
              <div className="text-sm text-gray-600 font-semibold mb-1">Best Season</div>
              <div className="text-lg font-bold text-gray-900">{trek.best_season}</div>
            </div>
          )}
        </div>

        {/* Group Size */}
        {(trek.group_size_min || trek.group_size_max) && (
          <div className="bg-white rounded-lg p-6 shadow-md mb-12">
            <h3 className="text-xl font-bold text-brand-dark mb-2">Group Size</h3>
            <p className="text-gray-700 text-lg">
              {trek.group_size_min} - {trek.group_size_max} people
            </p>
          </div>
        )}

        {/* Highlights */}
        {trek.highlights && trek.highlights.length > 0 && (
          <div className="bg-white rounded-lg p-8 shadow-md mb-12">
            <h3 className="text-2xl font-bold text-brand-dark mb-6">Trek Highlights</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trek.highlights.map((highlight: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-gray-700">
                  <span className="text-brand-accent font-bold text-lg">★</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What's Included & Not Included */}
        {((trek.includes && trek.includes.length > 0) || (trek.excludes && trek.excludes.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Included */}
            {trek.includes && trek.includes.length > 0 && (
              <div className="bg-white rounded-lg p-8 shadow-md">
                <h3 className="text-2xl font-bold text-brand-dark mb-6">What's Included</h3>
                <ul className="space-y-2">
                  {trek.includes.map((item: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-gray-700">
                      <span className="text-green-600 font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Not Included */}
            {trek.excludes && trek.excludes.length > 0 && (
              <div className="bg-white rounded-lg p-8 shadow-md">
                <h3 className="text-2xl font-bold text-brand-dark mb-6">Not Included</h3>
                <ul className="space-y-2">
                  {trek.excludes.map((item: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-gray-600">
                      <span className="text-gray-400 font-bold">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Itinerary */}
        {trek.itinerary && trek.itinerary.length > 0 && (
          <div className="bg-white rounded-lg p-8 shadow-md mb-12">
            <h2 className="text-3xl font-bold text-brand-dark mb-8">
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
          <div className="bg-white rounded-lg p-8 shadow-md mb-12">
            <h2 className="text-3xl font-bold text-brand-dark mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {trek.faqs.map((faq: any, idx: number) => (
                <div key={idx} className="border-b border-gray-200 pb-6 last:border-0">
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
          <div className="space-y-8 mb-12">
            {trek.extra_sections.map((section: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg p-8 shadow-md">
                <h2 className="text-2xl font-bold text-brand-dark mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-700 whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-brand-accent to-orange-600 rounded-lg p-8 text-center text-white shadow-xl">
          <h3 className="text-3xl font-bold mb-4">Ready to Trek?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join us on this incredible adventure
          </p>
          <a
            href={`mailto:info@geletrekking.com?subject=Trek Inquiry: ${trek.name}`}
            className="inline-block bg-white text-brand-accent px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Book Now
          </a>
        </div>
      </div>
    </Layout>
  );
}
