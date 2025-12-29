"use client";

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function BlogDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/blogs/${slug}`
        );
        setPost(res.data);
      } catch (err) {
        console.error("Failed to load blog post", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  return (
    <div className="min-h-screen bg-brand-light text-brand-secondary py-20 px-4">
      {loading ? (
        <p className="text-center text-gray-500">Loading…</p>
      ) : !post ? (
        <p className="text-center text-gray-500">Post not found.</p>
      ) : (
        <article className="max-w-4xl mx-auto">
          <Link href="/blog" className="text-brand-primary mb-6 inline-block">
            ← Back to Blog
          </Link>
          {post.coverImage && (
            <div className="h-72 mb-6 relative rounded-xl overflow-hidden shadow">
              <img
                src={post.coverImage}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {post.title}
          </h1>
          <div className="text-sm text-gray-500 mb-6">
            {post.author && <span className="mr-3">By {post.author}</span>}
            {post.createdAt && (
              <span>
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          {post.content && (
            <div
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }}
            />
          )}
        </article>
      )}
    </div>
  );
}