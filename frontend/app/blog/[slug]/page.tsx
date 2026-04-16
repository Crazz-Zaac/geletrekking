import { blogPosts } from '@/lib/data';
import { getBlogBySlug, getBlogs, type UiBlogPost } from '@/lib/api';
import BlogPostClient from './BlogPostClient';
import { notFound } from 'next/navigation';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  let post: UiBlogPost | null = null;
  let allPosts: UiBlogPost[] = blogPosts;

  try {
    const [apiPost, apiPosts] = await Promise.all([getBlogBySlug(slug), getBlogs()]);
    post = apiPost;
    if (apiPosts.length > 0) {
      allPosts = apiPosts;
    }
  } catch {
    // API failed, use fallback
  }

  // Fallback to embedded data if API didn't return a post
  const fallbackPost = blogPosts.find((item) => item.slug === slug) || null;
  const finalPost = post || fallbackPost;

  if (!finalPost) {
    notFound();
  }

  return <BlogPostClient post={finalPost} allPosts={allPosts} />;
}
