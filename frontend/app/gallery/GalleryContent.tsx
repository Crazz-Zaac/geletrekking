'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

type GalleryItem = {
  id: string;
  image: string;
  trekTitle: string;
  region: string;
  isFeatured: boolean;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const ITEMS_PER_PAGE = 6;

type SortOption = 'featured' | 'recent' | 'title';

function isSortOption(value: string | null): value is SortOption {
  return value === 'featured' || value === 'recent' || value === 'title';
}

interface GalleryContentProps {
  initialItems: GalleryItem[];
  heroImageUrl: string;
}

export function GalleryContent({ initialItems, heroImageUrl }: GalleryContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items] = useState<GalleryItem[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const categoryParam = searchParams?.get('category') || '';
    const qParam = searchParams?.get('q') || '';
    const sortParam = searchParams?.get('sort');
    const featuredParam = searchParams?.get('featured') === '1';
    const pageParam = Number.parseInt(searchParams?.get('page') || '1', 10);

    setSelectedCategory(categoryParam);
    setSearchQuery(qParam);
    setSortBy(isSortOption(sortParam) ? sortParam : 'featured');
    setFeaturedOnly(featuredParam);
    setCurrentPage(Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam);
  }, [searchParams]);

  const updateUrl = (next: {
    category: string;
    q: string;
    sort: SortOption;
    featured: boolean;
    page: number;
  }) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    if (next.category) params.set('category', next.category);
    else params.delete('category');

    if (next.q.trim()) params.set('q', next.q.trim());
    else params.delete('q');

    if (next.sort !== 'featured') params.set('sort', next.sort);
    else params.delete('sort');

    if (next.featured) params.set('featured', '1');
    else params.delete('featured');

    if (next.page > 1) params.set('page', String(next.page));
    else params.delete('page');

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const setPageAndUrl = (nextPage: number) => {
    setCurrentPage(nextPage);
    updateUrl({
      category: selectedCategory,
      q: searchQuery,
      sort: sortBy,
      featured: featuredOnly,
      page: nextPage,
    });
  };

  const categoryOptions = useMemo(() => {
    return Array.from(
      new Set(items.map((item) => item.region).filter(Boolean))
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (selectedCategory) {
      result = result.filter((item) => item.region === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.trekTitle.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q)
      );
    }

    if (featuredOnly) {
      result = result.filter((item) => item.isFeatured);
    }

    if (sortBy === 'title') {
      result.sort((a, b) => a.trekTitle.localeCompare(b.trekTitle));
    } else if (sortBy === 'recent') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else {
      result.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }

    return result;
  }, [items, selectedCategory, searchQuery, featuredOnly, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const paginatedItems = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage, totalPages]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setPageAndUrl(totalPages);
    }
  }, [currentPage, totalPages]);

  const selectedImage =
    selectedImageId !== null
      ? filteredItems.find((item) => item.id === selectedImageId) || null
      : null;

  const selectedImageIndex = selectedImage
    ? filteredItems.findIndex((item) => item.id === selectedImage.id)
    : -1;

  const openImage = (itemId: string) => {
    setSelectedImageId(itemId);
  };

  const closeModal = () => {
    setSelectedImageId(null);
  };

  const showPrev = () => {
    if (!selectedImage || filteredItems.length === 0 || selectedImageIndex < 0) return;
    const prevIndex = selectedImageIndex === 0 ? filteredItems.length - 1 : selectedImageIndex - 1;
    setSelectedImageId(filteredItems[prevIndex].id);
  };

  const showNext = () => {
    if (!selectedImage || filteredItems.length === 0 || selectedImageIndex < 0) return;
    const nextIndex = selectedImageIndex === filteredItems.length - 1 ? 0 : selectedImageIndex + 1;
    setSelectedImageId(filteredItems[nextIndex].id);
  };

  const activeFilters = [
    selectedCategory ? { key: 'category', label: 'Category', value: selectedCategory } : null,
    searchQuery.trim() ? { key: 'q', label: 'Search', value: searchQuery.trim() } : null,
    featuredOnly ? { key: 'featured', label: 'Type', value: 'Featured only' } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>;

  const clearAll = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSortBy('featured');
    setFeaturedOnly(false);
    setPageAndUrl(1);
    router.replace(pathname, { scroll: false });
  };

  const visiblePage = Math.min(currentPage, totalPages);

  const pageNumbers = useMemo(() => {
    const max = 5;
    if (totalPages <= max) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const start = Math.max(1, visiblePage - 2);
    const end = Math.min(totalPages, start + max - 1);
    const adjustedStart = Math.max(1, end - max + 1);

    return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
  }, [totalPages, visiblePage]);

  return (
    <>
      <section className="relative py-16 md:py-24 border-b border-border overflow-hidden">
        {heroImageUrl ? (
          <div className="absolute inset-0">
            <Image
              src={heroImageUrl}
              alt="Gallery hero"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/55" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        )}

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-3 text-center"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-white text-balance"
            >
              Trek Gallery
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg text-white/80 max-w-2xl mx-auto"
            >
              Explore destination photos from the gallery managed in your backend
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="sticky top-16 z-30 py-4 md:py-5 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 md:px-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px_140px] gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by trek or region..."
                value={searchQuery}
                onChange={(event) => {
                  const next = event.target.value;
                  setSearchQuery(next);
                  setPageAndUrl(1);
                  updateUrl({
                    category: selectedCategory,
                    q: next,
                    sort: sortBy,
                    featured: featuredOnly,
                    page: 1,
                  });
                }}
                className="w-full h-10 rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <select
              value={sortBy}
              onChange={(event) => {
                const nextSort = event.target.value as SortOption;
                setSortBy(nextSort);
                setPageAndUrl(1);
                updateUrl({
                  category: selectedCategory,
                  q: searchQuery,
                  sort: nextSort,
                  featured: featuredOnly,
                  page: 1,
                });
              }}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="featured">Sort: Featured first</option>
              <option value="recent">Sort: Recently added</option>
              <option value="title">Sort: Title A → Z</option>
            </select>

            <Button variant="outline" className="h-10" onClick={clearAll}>
              Clear all
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              className={selectedCategory === '' ? 'bg-primary text-white' : ''}
              onClick={() => {
                setSelectedCategory('');
                setPageAndUrl(1);
                updateUrl({
                  category: '',
                  q: searchQuery,
                  sort: sortBy,
                  featured: featuredOnly,
                  page: 1,
                });
              }}
            >
              All Categories
            </Button>

            {categoryOptions.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={selectedCategory === category ? 'bg-primary text-white' : ''}
                onClick={() => {
                  setSelectedCategory(category);
                  setPageAndUrl(1);
                  updateUrl({
                    category,
                    q: searchQuery,
                    sort: sortBy,
                    featured: featuredOnly,
                    page: 1,
                  });
                }}
              >
                {category}
              </Button>
            ))}

            <Button
              variant={featuredOnly ? 'default' : 'outline'}
              className={featuredOnly ? 'bg-primary text-white' : ''}
              onClick={() => {
                const nextFeatured = !featuredOnly;
                setFeaturedOnly(nextFeatured);
                setPageAndUrl(1);
                updateUrl({
                  category: selectedCategory,
                  q: searchQuery,
                  sort: sortBy,
                  featured: nextFeatured,
                  page: 1,
                });
              }}
            >
              Featured only
            </Button>
          </div>

          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => {
                    if (filter.key === 'category') {
                      setSelectedCategory('');
                      updateUrl({
                        category: '',
                        q: searchQuery,
                        sort: sortBy,
                        featured: featuredOnly,
                        page: 1,
                      });
                      setPageAndUrl(1);
                    }

                    if (filter.key === 'q') {
                      setSearchQuery('');
                      updateUrl({
                        category: selectedCategory,
                        q: '',
                        sort: sortBy,
                        featured: featuredOnly,
                        page: 1,
                      });
                      setPageAndUrl(1);
                    }

                    if (filter.key === 'featured') {
                      setFeaturedOnly(false);
                      updateUrl({
                        category: selectedCategory,
                        q: searchQuery,
                        sort: sortBy,
                        featured: false,
                        page: 1,
                      });
                      setPageAndUrl(1);
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium"
                >
                  {filter.label}: {filter.value}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          ) : null}

          <p className="text-sm text-muted-foreground">
            Showing {paginatedItems.length} of {filteredItems.length} image
            {filteredItems.length === 1 ? '' : 's'}
            {selectedCategory ? ` from ${selectedCategory}` : ' from all categories'}.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          {paginatedItems.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No gallery items found.
            </div>
          ) : (
            <>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {paginatedItems.map((item, index) => (
                  <motion.div key={item.id} variants={itemVariants}>
                    <article
                      className="overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => openImage(item.id)}
                    >
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={`${item.trekTitle} - ${item.region}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                        {item.isFeatured && (
                          <div className="absolute top-3 right-3 rounded-full bg-yellow-400 px-2.5 py-1 text-xs font-bold text-yellow-900">
                            Featured
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
                          {item.region}
                        </p>
                        <h3 className="text-sm font-bold text-foreground line-clamp-2">
                          {item.trekTitle}
                        </h3>
                      </div>
                    </article>
                  </motion.div>
                ))}
              </motion.div>

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPageAndUrl(Math.max(1, visiblePage - 1))}
                    disabled={visiblePage === 1}
                  >
                    Previous
                  </Button>

                  {pageNumbers.map((page) => (
                    <Button
                      key={page}
                      variant={page === visiblePage ? 'default' : 'outline'}
                      onClick={() => setPageAndUrl(page)}
                      className="min-w-10"
                    >
                      {page}
                    </Button>
                  ))}

                  <span className="text-sm text-muted-foreground px-2">
                    Page {visiblePage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    onClick={() => setPageAndUrl(Math.min(totalPages, visiblePage + 1))}
                    disabled={visiblePage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90" onClick={closeModal}>
          <div
            className="h-full w-full flex flex-col lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 relative flex items-center justify-center p-4 lg:p-8">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-20 bg-white/90 text-black rounded-full px-3 py-2 text-sm font-semibold hover:bg-white"
              >
                ✕
              </button>

              {filteredItems.length > 1 && (
                <>
                  <button
                    onClick={showPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 text-black rounded-full w-11 h-11 text-xl font-bold hover:bg-white"
                  >
                    ‹
                  </button>

                  <button
                    onClick={showNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 text-black rounded-full w-11 h-11 text-xl font-bold hover:bg-white"
                  >
                    ›
                  </button>
                </>
              )}

              <div className="relative w-full h-[60vh] lg:h-[85vh]">
                <Image
                  src={selectedImage.image}
                  alt={selectedImage.trekTitle}
                  fill
                  className="object-contain rounded-lg"
                  priority
                />
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs uppercase tracking-wider text-white/70">
                  {selectedImage.region}
                </p>
                <h3 className="text-lg md:text-xl font-semibold">
                  {selectedImage.trekTitle}
                </h3>
              </div>
            </div>

            <aside className="w-full lg:w-32 xl:w-40 border-t lg:border-t-0 lg:border-l border-white/10 bg-black/60 p-3 overflow-x-auto lg:overflow-y-auto">
              <div className="flex lg:flex-col gap-3">
                {filteredItems.map((item, index) => {
                  const isActive = index === selectedImageIndex;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedImageId(item.id)}
                      className={`relative shrink-0 w-24 h-24 lg:w-full lg:h-24 rounded-lg overflow-hidden border-2 transition ${
                        isActive
                          ? 'border-white scale-[1.02]'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={item.image}
                        alt={item.trekTitle}
                        fill
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}
