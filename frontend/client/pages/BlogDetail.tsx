import { Layout } from "@/components/Layout";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { Calendar, ArrowLeft } from "lucide-react";

export default function BlogDetail() {
  const { id } = useParams();
  const slug = id as string;

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-detail", slug],
    queryFn: async () => (await api.get(`/api/blogs/${slug}`)).data,
    enabled: !!slug,
  });

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 pt-28 pb-12 max-w-4xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeft size={18} /> Back to Blog
          </Link>

          {isLoading ? (
            <div className="mt-8 text-gray-600">Loading...</div>
          ) : error ? (
            <div className="mt-8 text-red-600">Post not found.</div>
          ) : (
            <>
              <h1 className="mt-6 text-4xl md:text-5xl font-bold text-gray-900">
                {post?.title}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>
                  {post?.createdAt
                    ? new Date(post.createdAt).toLocaleDateString()
                    : ""}
                </span>
                <span>•</span>
                <span>{post?.author || "GELE TREKKING"}</span>
              </div>

              {post?.coverImage ? (
                <div className="mt-8 rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-[360px] object-cover"
                  />
                </div>
              ) : null}

              {/* ✅ FIXED: renders HTML from the rich text editor */}
              <div
                className="prose prose-lg max-w-none mt-8"
                dangerouslySetInnerHTML={{ __html: post?.content || "" }}
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}