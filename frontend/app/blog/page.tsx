'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import { blogPosts } from '@/lib/data';
import { Clock3, Search, X } from 'lucide-react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getBlogs, type UiBlogPost } from '@/lib/api';

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

type BlogSortOption = 'latest' | 'oldest' | 'readTime' | 'az';

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

function BlogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<UiBlogPost[]>(blogPosts);
  const [loading, setLoading] = useState(true);
  const [selectedHashtag, setSelectedHashtag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<BlogSortOption>('latest');

  const hashtags = useMemo(
    () => ['All', ...Array.from(new Set(posts.flatMap((post) => post.hashtags || [])))],
    [posts]
  );

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const apiPosts = await getBlogs();
        if (apiPosts.length > 0) {
          setPosts(apiPosts);
        } else {
          setPosts(blogPosts);
        }
      } catch {
        setPosts(blogPosts);
      } finally {
        setLoading(false);
      }
    };

    void loadPosts();
  }, []);

  useEffect(() => {
    const tagParam = searchParams?.get('tag') || 'All';
    const queryParam = searchParams?.get('q') || '';
    const sortParam = searchParams?.get('sort');

    setSelectedHashtag(tagParam);
    setSearchQuery(queryParam);
    setSortBy(isSortOption(sortParam) ? sortParam : 'latest');
  }, [searchParams]);

  const updateUrl = (tag: string, query: string, sort: BlogSortOption) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    if (tag && tag !== 'All') params.set('tag', tag);
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
    setSelectedHashtag('All');
    setSearchQuery('');
    setSortBy('latest');
    router.replace(pathname, { scroll: false });
  };

  const filteredPosts = useMemo(() => {
    const byTag =
      selectedHashtag === 'All'
        ? posts
        : posts.filter((post) => (post.hashtags || []).includes(selectedHashtag));

    const byQuery = byTag.filter((post) => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        (post.hashtags || []).some((tag) => tag.toLowerCase().includes(q))
      );
    });

    const sorted = [...byQuery];
    if (sortBy === 'oldest') {
      sorted.sort((a, b) => toDateNumber(a.date) - toDateNumber(b.date));
    } else if (sortBy === 'readTime') {
      sorted.sort((a, b) => parseReadTimeToNumber(b.readTime) - parseReadTimeToNumber(a.readTime));
    } else if (sortBy === 'az') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => toDateNumber(b.date) - toDateNumber(a.date));
    }

    return sorted;
  }, [selectedHashtag, searchQuery, sortBy, posts]);

  const activeFilters = [
    selectedHashtag !== 'All' ? { key: 'tag', label: 'Tag', value: selectedHashtag } : null,
    searchQuery.trim() ? { key: 'q', label: 'Search', value: searchQuery.trim() } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>;

  const suggestedPosts = posts.slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={false}
              animate="visible"
              variants={containerVariants}
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <p className="text-xs md:text-sm font-semibold tracking-widest uppercase text-primary mb-2">Latest Updates</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Recent Articles</h2>
                </div>
                <p className="text-sm text-muted-foreground">{filteredPosts.length} articles</p>
              </motion.div>

              <motion.div variants={itemVariants} className="sticky top-16 z-20 rounded-xl border border-border bg-background/95 backdrop-blur p-3 md:p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px_120px] gap-2.5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search blog posts..."
                      value={searchQuery}
                      onChange={(event) => handleSearchChange(event.target.value)}
                      className="w-full h-10 rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(event) => handleSortChange(event.target.value as BlogSortOption)}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="latest">Sort: Latest</option>
                    <option value="oldest">Sort: Oldest</option>
                    <option value="readTime">Sort: Longest Read</option>
                    <option value="az">Sort: A → Z</option>
                  </select>

                  <button
                    onClick={clearAll}
                    className="h-10 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {hashtags.map((hashtag) => (
                    <button
                      key={hashtag}
                      onClick={() => handleTagChange(hashtag)}
                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        selectedHashtag === hashtag
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-foreground hover:bg-muted'
                      }`}
                      aria-pressed={selectedHashtag === hashtag}
                    >
                      {hashtag}
                    </button>
                  ))}
                </div>

                {activeFilters.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => {
                          if (filter.key === 'tag') handleTagChange('All');
                          if (filter.key === 'q') handleSearchChange('');
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium"
                      >
                        {filter.label}: {filter.value}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </motion.div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Card key={idx} className="p-3 space-y-3">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </Card>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <motion.div variants={itemVariants} className="space-y-4 text-sm text-muted-foreground rounded-lg border border-dashed border-border p-6 text-center">
                  <p>No articles found for your current filters.</p>
                  <button
                    onClick={clearAll}
                    className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
                  >
                    Reset filters
                  </button>
                  {suggestedPosts.length > 0 ? (
                    <div className="pt-4 border-t border-border text-left">
                      <p className="text-xs uppercase tracking-wide mb-2 text-muted-foreground">Suggested posts</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {suggestedPosts.map((post) => (
                          <BlogCard key={post.slug} post={post} compact />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              ) : (
                <motion.div
                  initial={false}
                  animate="visible"
                  variants={containerVariants}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {filteredPosts.map((post) => (
                    <motion.div key={post.slug} variants={itemVariants}>
                      <BlogCard post={post} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background pt-16" />}>
      <BlogContent />
    </Suspense>
  );
}

function BlogCard({ post, compact = false }: { post: UiBlogPost; compact?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="group h-full border-border overflow-hidden hover:shadow-sm transition-shadow">
        <div className={`relative ${compact ? 'h-28' : 'h-36'} overflow-hidden`}>
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className={`${compact ? 'p-3' : 'p-4'} flex flex-col gap-2`}>
          <div className="flex items-center justify-between gap-3">
            <Badge variant="secondary" className="font-medium text-[11px]">
              {post.category}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>

          <h3 className="text-sm md:text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className={`text-xs text-muted-foreground ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
            {post.excerpt}
          </p>

          {post.hashtags && post.hashtags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {post.hashtags.slice(0, 3).map((hashtag) => (
                <span key={`${post.slug}-${hashtag}`} className="text-[11px] text-primary/90 bg-primary/10 px-2 py-0.5 rounded-full">
                  {hashtag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{post.author}</span>
            <span>{post.date}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
