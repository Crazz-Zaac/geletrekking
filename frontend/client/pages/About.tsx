import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export default function About() {
  const { data, isLoading } = useQuery({
    queryKey: ["about-page"],
    queryFn: async () => (await api.get("/api/about")).data,
  });

  return (
    <Layout>
      <div className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative overflow-hidden min-h-[420px] flex items-end">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="https://ik.imagekit.io/dj8jxmvvw/sample-video.mp4?updatedAt=1770239642405"
            autoPlay muted loop playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-teal-800/60" />
          <div className="container mx-auto px-4 relative z-10 pt-32 pb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {data?.heroTitle || "About GELE TREKKING"}
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl">
              {data?.heroSubtitle || "Your trusted trekking partner in Nepal."}
            </p>
          </div>
        </section>

        {isLoading ? (
          <div className="container mx-auto px-4 py-16 text-gray-600">Loading...</div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">

            {/* Mission */}
            {(data?.missionTitle || data?.missionBody) && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {data?.missionTitle || "Our Mission"}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {data?.missionBody}
                </p>
              </div>
            )}

            {/* Story */}
            {(data?.storyTitle || data?.storyBody) && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {data?.storyTitle || "Our Story"}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {data?.storyBody}
                </p>
              </div>
            )}

            {/* Highlights — vertical list */}
            {data?.highlights?.length > 0 && (
              <div className="space-y-6">
                {data.highlights.map((h: any, idx: number) => (
                  <div key={idx}>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{h.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{h.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Stats — 2-col grid */}
            {data?.stats?.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {data.stats.map((s: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center"
                  >
                    <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                    <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </Layout>
  );
}
