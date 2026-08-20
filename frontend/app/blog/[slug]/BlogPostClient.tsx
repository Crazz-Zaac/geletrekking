'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, ChevronLeft, Clock3, MapPin, Tag, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import type { UiBlogPost } from '@/lib/api';
import { marked } from 'marked';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface BlogPostClientProps {
  post: UiBlogPost;
  allPosts: UiBlogPost[];
}

function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSizedMarkdownImages(content: string) {
  return content.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\{\s*(?:width|w)=(\d{1,4})(?:px)?(?:\s+(?:height|h)=(\d{1,4})(?:px)?)?\s*\}/g,
    (_match, alt: string, src: string, title: string | undefined, width: string, height: string | undefined) => {
      const imageWidth = Number(width);
      const imageHeight = height ? Number(height) : undefined;
      const attrs = [
        `src="${escapeHtml(src)}"`,
        `alt="${escapeHtml(alt)}"`,
        title ? `title="${escapeHtml(title)}"` : '',
        `width="${imageWidth}"`,
        imageHeight ? `height="${imageHeight}"` : '',
        `style="max-width: min(100%, ${imageWidth}px);${imageHeight ? ` aspect-ratio: ${imageWidth} / ${imageHeight};` : ''}"`,
      ].filter(Boolean).join(' ');

      return `<img ${attrs} />`;
    }
  );
}

export default function BlogPostClient({ post, allPosts }: BlogPostClientProps) {
  const [renderedContent, setRenderedContent] = useState('');

  useEffect(() => {
    let isActive = true;

    Promise.resolve(marked.parse(renderSizedMarkdownImages(post.content || ''))).then((html) => {
      if (isActive) {
        setRenderedContent(html);
      }
    });

    return () => {
      isActive = false;
    };
  }, [post.content]);

  const relatedPosts = useMemo(() => {
    const byTag = allPosts.filter((item) => {
      if (item.slug === post.slug) return false;
      return (item.hashtags || []).some((tag) => (post.hashtags || []).includes(tag));
    });

    const fallback = allPosts.filter((item) => item.slug !== post.slug && !byTag.some((related) => related.slug === item.slug));
    return [...byTag, ...fallback].slice(0, 3);
  }, [allPosts, post.hashtags, post.slug]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative min-h-[520px] overflow-hidden"
        >
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

          <div className="absolute inset-x-0 bottom-0 px-4 pb-10 md:px-6 md:pb-14">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="container mx-auto max-w-5xl space-y-6 text-white"
            >
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">{post.category}</Badge>
                {(post.hashtags || []).slice(0, 3).map((hashtag) => (
                  <span key={hashtag} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                    {hashtag}
                  </span>
                ))}
              </motion.div>
              <motion.h1 variants={itemVariants} className="font-serif text-4xl font-bold leading-tight text-balance md:text-6xl">
                {post.title}
              </motion.h1>
              {post.excerpt ? (
                <motion.p variants={itemVariants} className="max-w-3xl text-base leading-8 text-white/85 md:text-xl">
                  {post.excerpt}
                </motion.p>
              ) : null}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 text-sm text-white/85">
                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  {post.author}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formatDisplayDate(post.date)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {post.readTime} read
                </span>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <section className="border-b border-border bg-muted/30 py-4">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:px-6">
            <Link href="/blog" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary/80">
              <ChevronLeft className="h-4 w-4" />
              Back to Blog
            </Link>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Nepal trekking insight
            </span>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]"
          >
            <motion.article variants={itemVariants} className="mx-auto w-full max-w-3xl">
              <div
                className="markdown-content trekking-blog-content"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />

              {(post.hashtags || []).length > 0 ? (
                <div className="mt-12 border-t border-border pt-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    {post.hashtags?.map((hashtag) => (
                      <Link
                        key={hashtag}
                        href={`/blog?tag=${encodeURIComponent(hashtag)}`}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {hashtag}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </motion.article>

            <motion.aside variants={itemVariants} className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Article Details</p>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <UserRound className="h-4 w-4 text-primary" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>{formatDisplayDate(post.date)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-4 w-4 text-primary" />
                    <span>{post.readTime} read</span>
                  </div>
                </div>
              </div>

              {relatedPosts.length > 0 ? (
                <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <h2 className="font-serif text-xl font-bold text-foreground">Related Articles</h2>
                  <div className="mt-4 space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.slug}
                        href={`/blog/${relatedPost.slug}`}
                        className="group block border-b border-border pb-4 last:border-0 last:pb-0"
                      >
                        <h3 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                          {relatedPost.title}
                        </h3>
                        <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5" />
                          {relatedPost.readTime} read
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              <Link href="/contact" className="group block rounded-lg border border-primary/25 bg-primary p-5 text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/75">Plan With Us</p>
                <h2 className="mt-3 font-serif text-2xl font-bold">Need trail advice?</h2>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/85">
                  Talk to the Gele Trekking team about timing, route choice, permits, and preparation.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  Start planning
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>

              <Button asChild variant="outline" className="w-full border-primary text-primary">
                <Link href="/blog">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
            </motion.aside>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
