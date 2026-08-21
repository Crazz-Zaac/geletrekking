'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, ChevronLeft, Clock3, Link as LinkIcon, Mail, MapPin, Tag, UserRound } from 'lucide-react';
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

type ShareIconProps = { className?: string };

function FacebookShareIcon({ className }: ShareIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.019 4.388 11.009 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.237 2.686.237v2.971h-1.514c-1.49 0-1.956.93-1.956 1.885v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.082 24 18.092 24 12.073z" />
    </svg>
  );
}

function XShareIcon({ className }: ShareIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function LinkedInShareIcon({ className }: ShareIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.85-3.037-1.852 0-2.136 1.446-2.136 2.939v5.667H9.353V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.604 0 4.268 2.372 4.268 5.455v6.286zM5.337 7.433a2.063 2.063 0 1 1 0-4.127 2.063 2.063 0 0 1 0 4.127zM7.114 20.452H3.56V9h3.554v11.452z" />
    </svg>
  );
}

function WhatsAppShareIcon({ className }: ShareIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.46 0 .08 5.37.08 11.98c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.62a11.96 11.96 0 0 0 5.88 1.5h.01c6.6 0 11.98-5.37 11.98-11.98 0-3.2-1.25-6.2-3.53-8.42ZM12.07 21.86h-.01a9.93 9.93 0 0 1-5.06-1.39l-.36-.21-3.67.96.98-3.58-.23-.37a9.91 9.91 0 0 1-1.52-5.29c0-5.49 4.47-9.96 9.97-9.96 2.66 0 5.16 1.04 7.04 2.92a9.9 9.9 0 0 1 2.92 7.04c0 5.5-4.47 9.98-9.96 9.98Zm5.46-7.46c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

function TelegramShareIcon({ className }: ShareIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0Zm4.962 7.224c.18-.002.583.042.844.254.218.177.277.416.306.584.03.168.067.552.038.852-.333 3.503-1.775 12.01-2.508 15.934-.31 1.66-.92 2.216-1.511 2.27-1.284.118-2.26-.848-3.505-1.664-1.947-1.276-3.046-2.07-4.936-3.315-2.184-1.44-.768-2.23.476-3.522.326-.338 5.987-5.486 6.096-5.952.014-.058.027-.274-.102-.388-.13-.114-.32-.075-.458-.043-.195.044-3.305 2.098-9.331 6.162-.883.606-1.683.901-2.4.886-.79-.017-2.31-.447-3.44-.814-1.384-.45-2.485-.689-2.39-1.453.05-.398.598-.806 1.646-1.224 6.453-2.81 10.756-4.662 12.91-5.556 6.15-2.556 7.429-3.001 8.265-3.016Z" transform="scale(.75) translate(4 0)" />
    </svg>
  );
}

function RedditShareIcon({ className }: ShareIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M24 11.779c0-1.459-1.192-2.645-2.657-2.645-.715 0-1.363.286-1.84.746-1.81-1.191-4.259-1.949-6.971-2.046l1.172-5.478 3.795.807c.045.965.844 1.738 1.82 1.738 1.004 0 1.819-.814 1.819-1.817S20.323 1.267 19.319 1.267c-.715 0-1.333.415-1.63 1.016l-4.199-.894a.6.6 0 0 0-.713.461l-1.286 6.012c-2.79.077-5.31.841-7.16 2.057a2.65 2.65 0 0 0-1.674-.589C1.192 9.33 0 10.516 0 11.975c0 .971.533 1.818 1.32 2.277-.052.282-.08.571-.08.864 0 4.03 4.83 7.303 10.78 7.303s10.78-3.273 10.78-7.303c0-.315-.031-.625-.09-.927A2.63 2.63 0 0 0 24 11.779ZM6.928 13.856c0-1.004.812-1.817 1.816-1.817s1.816.813 1.816 1.817-.812 1.817-1.816 1.817-1.816-.813-1.816-1.817Zm9.72 4.608c-1.302 1.302-3.776 1.4-4.62 1.4-.844 0-3.318-.098-4.62-1.4a.607.607 0 0 1 .859-.858c.822.822 2.622 1.043 3.76 1.043 1.139 0 2.94-.221 3.761-1.043a.607.607 0 0 1 .86.858Zm-1.39-2.791c-1.004 0-1.816-.813-1.816-1.817s.812-1.817 1.816-1.817 1.816.813 1.816 1.817-.812 1.817-1.816 1.817Z" />
    </svg>
  );
}

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

function getYouTubeId(value: string) {
  const trimmed = value.trim();
  const directId = trimmed.match(/^[a-zA-Z0-9_-]{11}$/)?.[0];
  if (directId) return directId;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] || null;
    if (url.searchParams.get('v')) return url.searchParams.get('v');
    const parts = url.pathname.split('/').filter(Boolean);
    const embedIndex = parts.findIndex((part) => part === 'embed' || part === 'shorts');
    if (embedIndex >= 0) return parts[embedIndex + 1] || null;
  } catch {
    return null;
  }

  return null;
}

function renderYouTubeEmbeds(content: string) {
  return content.replace(
    /::youtube(?:\[([^\]]*)\])?\(([^)\s]+)\)/g,
    (match, title: string | undefined, url: string) => {
      const videoId = getYouTubeId(url);
      if (!videoId) return match;
      const safeTitle = escapeHtml(title?.trim() || 'YouTube video');

      return `<div class="blog-video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(videoId)}" title="${safeTitle}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
    }
  );
}

function renderBlogMarkdown(content: string) {
  return renderYouTubeEmbeds(renderSizedMarkdownImages(content));
}

export default function BlogPostClient({ post, allPosts }: BlogPostClientProps) {
  const [renderedContent, setRenderedContent] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  useEffect(() => {
    let isActive = true;

    Promise.resolve(marked.parse(renderBlogMarkdown(post.content || ''))).then((html) => {
      if (isActive) {
        setRenderedContent(html);
      }
    });

    return () => {
      isActive = false;
    };
  }, [post.content]);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const shareLinks = useMemo(() => {
    if (!shareUrl) return [];

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(post.title);
    return [
      { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, Icon: FacebookShareIcon, color: 'text-[#1877F2]' },
      { label: 'X', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, Icon: XShareIcon, color: 'text-foreground' },
      { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, Icon: LinkedInShareIcon, color: 'text-[#0A66C2]' },
      { label: 'WhatsApp', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, Icon: WhatsAppShareIcon, color: 'text-[#25D366]' },
      { label: 'Telegram', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, Icon: TelegramShareIcon, color: 'text-[#26A5E4]' },
      { label: 'Reddit', href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`, Icon: RedditShareIcon, color: 'text-[#FF4500]' },
    ];
  }, [post.title, shareUrl]);

  const showCopiedState = () => {
    setShowCopiedToast(true);
    window.setTimeout(() => setShowCopiedToast(false), 1800);
  };

  const handleShareLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.setAttribute('readonly', '');
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    showCopiedState();
  };

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

              <div className="relative rounded-lg border border-border bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Share This Story</p>
                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={handleShareLink}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Share this link
                  </button>
                  <div className="space-y-2 pt-2">
                    {shareLinks.map((shareLink) => {
                      const Icon = shareLink.Icon;
                      return (
                        <a
                          key={shareLink.label}
                          href={shareLink.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-11 w-full items-center gap-3 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-muted/50"
                        >
                          <Icon className={`h-5 w-5 ${shareLink.color}`} />
                          <span>{shareLink.label}</span>
                        </a>
                      );
                    })}
                    <a
                      href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareUrl)}`}
                      className="flex h-11 w-full items-center gap-3 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-muted/50"
                    >
                      <Mail className="h-5 w-5 text-primary" />
                      <span>Email</span>
                    </a>
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
      {showCopiedToast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-lg dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 sm:left-auto sm:right-6 sm:translate-x-0">
          Link Copied
        </div>
      ) : null}
      <Footer />
    </>
  );
}
