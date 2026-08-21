import type { Metadata } from 'next';
import { getBlogBySlug, getBlogs, type UiBlogPost } from '@/lib/api';
import BlogPostClient from './BlogPostClient';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/json-ld';
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, truncateDescription } from '@/lib/seo';

export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

async function loadBlog(slug: string) {
  let post: UiBlogPost | null = null;
  let allPosts: UiBlogPost[] = [];

  try {
    const [apiPost, apiPosts] = await Promise.all([getBlogBySlug(slug), getBlogs()]);
    post = apiPost;
    allPosts = apiPosts;
  } catch {
    // Keep the public route tied to backend-published content only.
  }

  return { post, allPosts };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await loadBlog(slug);

  if (!post) {
    return buildMetadata({
      title: 'Blog Post Not Found',
      description: 'This Gele Trekking blog post could not be found.',
      path: `/blog/${slug}`,
    });
  }

  return buildMetadata({
    title: post.title,
    description: truncateDescription(post.excerpt || post.content, `Read ${post.title} from Gele Trekking.`),
    path: `/blog/${post.slug}`,
    image: post.image,
    type: 'article',
    publishedTime: post.date,
    modifiedTime: post.date,
    tags: post.hashtags,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const { post, allPosts } = await loadBlog(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd data={[
        articleJsonLd(post, `/blog/${post.slug}`),
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ]),
      ]} />
      <BlogPostClient post={post} allPosts={allPosts} />
    </>
  );
}
