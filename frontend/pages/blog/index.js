"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/blogs`
        );
        setPosts(res.data || []);
      } catch (err) {
        console.error("Failed to load blog posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-brand-light text-brand-secondary py-20 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
        Blog
      </h1>
      {loading ? (
        <p className="text-center text-gray-500">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">No blog posts found.</p>
      ) : (
        <div className="max-w-5xl mx-auto grid gap-8">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-200"
            >
              {post.coverImage && (
                <div className="h-56 relative">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                {post.excerpt && (
                  <p className="text-gray-600 text-sm mb-4 truncate">
                    {post.excerpt}
                  </p>
                )}
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-brand-primary font-semibold"
                >
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}