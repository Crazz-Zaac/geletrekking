import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export default function Testimonials() {
  const { data: items, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const response = await api.get("/api/testimonials");
      console.log("Fetched testimonials:", response.data);
      return response.data;
    },
  });

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-teal-50">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Testimonials
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              What our trekkers say about GELE TREKKING.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-600 text-lg">Loading testimonials...</div>
              </div>
            ) : items && items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((t: any) => {
                  const hasImage = t.image && typeof t.image === 'string' && t.image.trim().length > 0;
                  console.log(`${t.name}: hasImage=${hasImage}, image="${t.image}"`);
                  
                  return (
                    <div
                      key={t._id}
                      className="rounded-2xl shadow-lg bg-white p-6 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {/* Profile Image */}
                        {hasImage ? (
                          <img
                            src={t.image}
                            alt={t.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                            onLoad={() => console.log("✅ Image loaded successfully:", t.image)}
                            onError={(e) => {
                              console.error("❌ Image failed to load:", t.image);
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=3b82f6&color=fff&size=64&bold=true`;
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Name, Country, and Rating */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 truncate">{t.name}</div>
                          {t.country && (
                            <div className="text-sm text-gray-500 truncate">
                              {t.country}
                            </div>
                          )}
                          <div className="text-sm text-yellow-600 font-semibold mt-1">
                            {"★".repeat(Math.min(5, Math.max(0, t.rating)))}
                            {"☆".repeat(Math.max(0, 5 - t.rating))}
                          </div>
                        </div>
                      </div>

                      {/* Testimonial Message */}
                      <p className="text-gray-700 leading-relaxed line-clamp-4">
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
      </div>
    </Layout>
  );
}