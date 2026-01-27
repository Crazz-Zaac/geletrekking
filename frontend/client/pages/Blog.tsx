import { Layout } from "@/components/Layout";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["public-blogs"],
    queryFn: async () => (await api.get("/api/blogs")).data,
  });

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-teal-50">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Travel Blog
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Stories, guides, and updates from GELE TREKKING.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="text-gray-600">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(posts || []).map((p: any) => (
                  <article
                    key={p._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="h-48 bg-gray-100">
                      {p.coverImage ? (
                        <img
                          src={p.coverImage}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-3 gap-2">
                        <Calendar size={16} />
                        <span>
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {p.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {p.excerpt || p.content?.slice(0, 140) + "..."}
                      </p>

                      <Link
                        to={`/blog/${p.slug}`}
                        className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
                      >
                        Read More →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
