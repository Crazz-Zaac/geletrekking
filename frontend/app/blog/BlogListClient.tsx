'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarDays, Clock3, Compass, Eye, Heart, Search, X } from 'lucide-react';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { getBlogs, type UiBlogPost } from '@/lib/api';
import { cn } from '@/lib/utils';

type BlogSortOption = 'latest' | 'oldest' | 'readTime' | 'az';

const BLOG_BATCH_SIZE = 9;
const ALL = 'All';

function isSortOption(value: string | null): value is BlogSortOption {
  return value === 'latest' || value === 'oldest' || value === 'readTime' || value === 'az';
}

function parseReadTimeToNumber(readTime: string): number {
  const parsed = Number.parseInt(readTime.replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toDateNumber(value: string): number {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/** "2026-08-23" → "23 Aug 2026" */
function prettyDate(value: string): string {
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(time);
}

function readTimeLabel(value: string) {
  return /read/i.test(value) ? value : `${value} read`;
}

function BlogContent({ initialPosts }: { initialPosts: UiBlogPost[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<UiBlogPost[]>(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [selectedHashtag, setSelectedHashtag] = useState(ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<BlogSortOption>('latest');
  const [visibleCount, setVisibleCount] = useState(BLOG_BATCH_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Data is rendered on the server; only fetch in the browser as a fallback.
    if (initialPosts.length > 0) return;
    const loadPosts = async () => {
      setLoading(true);
      try {
        setPosts(await getBlogs());
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    void loadPosts();
  }, [initialPosts.length]);

  useEffect(() => {
    const sortParam = searchParams?.get('sort');
    setSelectedHashtag(searchParams?.get('tag') || ALL);
    setSearchQuery(searchParams?.get('q') || '');
    setSortBy(isSortOption(sortParam) ? sortParam : 'latest');
  }, [searchParams]);

  // Topics: hashtags used by at least two posts (single-use tags are noise),
  // plus the selected one so a ?tag= link from an article still shows as active.
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) for (const tag of post.hashtags || []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    const list = [...counts.entries()].filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
    if (selectedHashtag !== ALL && !list.includes(selectedHashtag)) list.push(selectedHashtag);
    return list;
  }, [posts, selectedHashtag]);

  const updateUrl = (tag: string, query: string, sort: BlogSortOption) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (tag && tag !== ALL) params.set('tag', tag);
    else params.delete('tag');
    if (query.trim()) params.set('q', query.trim());
    else params.delete('q');
    if (sort !== 'latest') params.set('sort', sort);
    else params.delete('sort');
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  const handleTagChange = (tag: string) => {
    setSelectedHashtag(tag);
    updateUrl(tag, searchQuery, sortBy);
  };
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateUrl(selectedHashtag, query, sortBy);
  };
  const handleSortChange = (sort: BlogSortOption) => {
    setSortBy(sort);
    updateUrl(selectedHashtag, searchQuery, sort);
  };
  const clearAll = () => {
    setSelectedHashtag(ALL);
    setSearchQuery('');
    setSortBy('latest');
    router.replace(pathname, { scroll: false });
  };

  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = posts
      .filter((post) => selectedHashtag === ALL || (post.hashtags || []).includes(selectedHashtag))
      .filter((post) =>
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        (post.hashtags || []).some((tag) => tag.toLowerCase().includes(q))
      );
    if (sortBy === 'oldest') list.sort((a, b) => toDateNumber(a.date) - toDateNumber(b.date));
    else if (sortBy === 'readTime') list.sort((a, b) => parseReadTimeToNumber(b.readTime) - parseReadTimeToNumber(a.readTime));
    else if (sortBy === 'az') list.sort((a, b) => a.title.localeCompare(b.title));
    else list.sort((a, b) => toDateNumber(b.date) - toDateNumber(a.date));
    return list;
  }, [selectedHashtag, searchQuery, sortBy, posts]);

  useEffect(() => {
    setVisibleCount(BLOG_BATCH_SIZE);
  }, [selectedHashtag, searchQuery, sortBy, posts]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisibleCount((prev) => Math.min(prev + BLOG_BATCH_SIZE, filteredPosts.length));
      },
      { rootMargin: '200px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredPosts.length]);

  const isFiltered = selectedHashtag !== ALL || searchQuery.trim() !== '' || sortBy !== 'latest';
  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMorePosts = visibleCount < filteredPosts.length;
  // A big "featured" story only on the unfiltered page; filtered results are a plain grid.
  const featuredPost = !isFiltered ? filteredPosts[0] : undefined;
  const gridPosts = featuredPost ? visiblePosts.slice(1) : visiblePosts;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        {/* Header */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-end md:px-6 md:py-16">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <Compass className="h-4 w-4" aria-hidden="true" /> Trekking journal
              </p>
              <h1 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">Stories from the trail</h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                Trip reports, route notes and life in the Himalaya, written by the Gele Trekking team and the trekkers we guide.
              </p>
            </div>
            <label className="relative block">
              <span className="sr-only">Search articles</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search articles"
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="h-12 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:px-6 md:py-14">
          {/* Topics + sort */}
          <div className="mb-8 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by topic">
              {[ALL, ...topics].map((tag) => {
                const active = selectedHashtag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagChange(tag)}
                    aria-pressed={active}
                    className={cn(
                      'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      active ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {tag === ALL ? 'All stories' : tag}
                  </button>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center gap-3 text-sm">
              {isFiltered && (
                <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear
                </button>
              )}
              <label className="flex items-center gap-2 text-muted-foreground">
                <span>Sort</span>
                <select
                  value={sortBy}
                  onChange={(event) => handleSortChange(event.target.value as BlogSortOption)}
                  className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="latest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="readTime">Longest read</option>
                  <option value="az">A–Z</option>
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="space-y-3">
                  <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border p-10 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 font-medium text-foreground">{posts.length === 0 ? 'No stories published yet.' : 'No stories match your search.'}</p>
              {posts.length > 0 && (
                <button type="button" onClick={clearAll} className="mt-4 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                  Show all stories
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              {featuredPost && <FeaturedBlogCard post={featuredPost} />}

              {gridPosts.length > 0 && (
                <div>
                  {featuredPost && <h2 className="mb-6 font-serif text-2xl font-bold text-foreground">More stories</h2>}
                  <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {gridPosts.map((post) => (
                      <BlogCard key={post.slug} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {hasMorePosts && (
                <div ref={loadMoreRef} className="text-center text-xs text-muted-foreground">Loading more stories…</div>
              )}
            </div>
          )}

          {/* Next step */}
          <aside className="mt-16 grid gap-6 overflow-hidden rounded-3xl bg-primary px-6 py-8 text-primary-foreground md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-10">
            <div>
              <h2 className="font-serif text-2xl font-bold md:text-3xl">Planning your own trek?</h2>
              <p className="mt-2 max-w-xl text-primary-foreground/80">Permits, gear, altitude and seasons: our planning guides cover what to sort out before you fly.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/guides" className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-background/90">
                Planning guides <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/packing-list" className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-5 py-2.5 text-sm font-semibold transition hover:bg-primary-foreground/10">
                Free packing list
              </Link>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function BlogListClient({ initialPosts }: { initialPosts: UiBlogPost[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background pt-16" />}>
      <BlogContent initialPosts={initialPosts} />
    </Suspense>
  );
}

function PostMeta({ post, className }: { post: UiBlogPost; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground', className)}>
      <span className="inline-flex items-center gap-1">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
        <time dateTime={post.date}>{prettyDate(post.date)}</time>
      </span>
      <span className="inline-flex items-center gap-1">
        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
        {readTimeLabel(post.readTime)}
      </span>
      {post.views > 0 ? (
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Views: </span>
          {post.views.toLocaleString()}
        </span>
      ) : null}
      {post.likes > 0 ? (
        <span className="inline-flex items-center gap-1">
          <Heart className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Likes: </span>
          {post.likes.toLocaleString()}
        </span>
      ) : null}
    </div>
  );
}

function Byline({ author }: { author: string }) {
  if (!author) return null;
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary" aria-hidden="true">
        {author.trim().charAt(0)}
      </span>
      {author}
    </span>
  );
}

function BlogCard({ post }: { post: UiBlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col focus-visible:outline-none">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted ring-offset-background group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2">
        <Image
          src={post.image}
          alt=""
          fill
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />
      </div>
      <PostMeta post={post} className="mt-4" />
      <h3 className="mt-2 font-serif text-xl font-bold leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-primary">
        {post.title}
      </h3>
      {post.excerpt && <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">{post.excerpt}</p>}
      <div className="mt-4">
        <Byline author={post.author} />
      </div>
    </Link>
  );
}

function FeaturedBlogCard({ post }: { post: UiBlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted md:aspect-auto md:min-h-[24rem]">
        <Image
          src={post.image}
          alt=""
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
          sizes="(max-width: 768px) 100vw, 60vw"
        />
      </div>
      <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
        <span className="w-fit rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[oklch(0.5_0.14_55)]">Latest story</span>
        <h2 className="font-serif text-2xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary md:text-4xl">{post.title}</h2>
        {post.excerpt && <p className="leading-relaxed text-muted-foreground line-clamp-3">{post.excerpt}</p>}
        <PostMeta post={post} />
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <Byline author={post.author} />
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Read story <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
