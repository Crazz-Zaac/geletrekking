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
        <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-teal-50">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {data?.heroTitle || "About GELE TREKKING"}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              {data?.heroSubtitle || "Your trusted trekking partner in Nepal."}
            </p>
          </div>
        </section>

        {isLoading ? (
          <div className="container mx-auto px-4 py-16 text-gray-600">Loading...</div>
        ) : (
          <>
            {data?.heroImageUrl ? (
              <div className="container mx-auto px-4 -mt-10">
                <div className="rounded-3xl overflow-hidden shadow-xl bg-gray-100">
                  <img
                    src={data.heroImageUrl}
                    alt="About hero"
                    className="w-full h-[360px] object-cover"
                  />
                </div>
              </div>
            ) : null}

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
