import { getBlogBySlug, getBlogs, type UiBlogPost } from '@/lib/api';
import BlogPostClient from './BlogPostClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  let post: UiBlogPost | null = null;
  let allPosts: UiBlogPost[] = [];

  try {
    const [apiPost, apiPosts] = await Promise.all([getBlogBySlug(slug), getBlogs()]);
    post = apiPost;
    allPosts = apiPosts;
  } catch {
    // Keep the public route tied to backend-published content only.
  }

  if (!post) {
    notFound();
  }

  return <BlogPostClient post={post} allPosts={allPosts} />;
}
