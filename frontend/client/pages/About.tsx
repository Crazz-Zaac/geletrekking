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

        {/* HERO with background video + overlay */}
        <section className="relative overflow-hidden min-h-[520px] flex items-end">
          {/* Background Video */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="https://ik.imagekit.io/dj8jxmvvw/sample-video.mp4?updatedAt=1770239642405"
            autoPlay
            muted
            loop
            playsInline
          />

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-teal-800/60" />

          {/* Hero text on top of overlay */}
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
          <>
            <section className="py-16">
              <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="rounded-3xl bg-white shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {data?.missionTitle || "Our Mission"}
                  </h2>
                  <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
                    {data?.missionBody || ""}
                  </p>
                </div>
                <div className="rounded-3xl bg-white shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {data?.storyTitle || "Our Story"}
                  </h2>
                  <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
                    {data?.storyBody || ""}
                  </p>
                </div>
              </div>
            </section>

            <section className="pb-16">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(data?.highlights || []).map((h: any, idx: number) => (
                    <div key={idx} className="rounded-3xl bg-white shadow-lg p-6">
                      <div className="text-xl font-bold text-gray-900">{h.title}</div>
                      <div className="mt-2 text-gray-700">{h.description}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(data?.stats || []).map((s: any, idx: number) => (
                    <div key={idx} className="rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 p-5 text-center">
                      <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                      <div className="text-sm text-gray-600">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}