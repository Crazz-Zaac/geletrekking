import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export default function Testimonials() {
  const { data: items, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => (await api.get("/api/testimonials")).data,
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
              <div className="text-gray-600">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(items || []).map((t: any) => (
                  <div
                    key={t._id}
                    className="rounded-2xl shadow-lg bg-white p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-900">{t.name}</div>
                        <div className="text-sm text-gray-500">{t.country || ""}</div>
                      </div>
                      <div className="text-sm text-yellow-600 font-semibold">
                        {t.rating}★
                      </div>
                    </div>

                    <p className="mt-4 text-gray-700 leading-relaxed">
                      {t.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
