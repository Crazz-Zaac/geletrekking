'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Suspense, useEffect, useMemo, useState } from 'react';

type BackendGalleryItem = {
  _id: string;
  title?: string;
  imageUrl?: string;
  category?: string;
  isFeatured?: boolean;
};

type BackendHeroResponse = {
  heroImageUrl?: string;
};

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

function GalleryPageContent() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchGalleryItems = async (): Promise<BackendGalleryItem[]> => {
    // Change this endpoint if your backend route is different
    const response = await fetch('/api/gallery/items', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch gallery items');
    }

    return response.json();
  };

  const fetchHeroImage = async (): Promise<BackendHeroResponse> => {
    // Change this endpoint if your backend route is different
    const response = await fetch('/api/gallery/hero', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hero image');
    }

    return response.json();
  };

  const refresh = async () => {
    setLoading(true);
    setError('');

    try {
      const [galleryItems, hero] = await Promise.all([
        fetchGalleryItems(),
        fetchHeroImage(),
      ]);

      const mappedItems: GalleryItem[] = galleryItems
        .filter((item) => item.imageUrl)
        .map((item) => ({
          id: item._id,
          image: item.imageUrl || '',
          trekTitle: item.title || 'Untitled',
          region: item.category || 'Uncategorized',
          isFeatured: Boolean(item.isFeatured),
        }));

      setItems(mappedItems);
      setHeroImageUrl(hero.heroImageUrl || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const categoryOptions = useMemo(() => {
    return Array.from(
      new Set(items.map((item) => item.region).filter(Boolean))
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return items;
    return items.filter((item) => item.region === selectedCategory);
  }, [items, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const paginatedItems = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const selectedImage =
    selectedImageIndex !== null ? paginatedItems[selectedImageIndex] : null;

  const openImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const showPrev = () => {
    if (selectedImageIndex === null || paginatedItems.length === 0) return;
    setSelectedImageIndex(
      selectedImageIndex === 0 ? paginatedItems.length - 1 : selectedImageIndex - 1
    );
  };

  const showNext = () => {
    if (selectedImageIndex === null || paginatedItems.length === 0) return;
    setSelectedImageIndex(
      selectedImageIndex === paginatedItems.length - 1 ? 0 : selectedImageIndex + 1
    );
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-16">
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

        <section className="py-6 md:py-8 border-b border-border">
          <div className="container mx-auto px-4 md:px-6 space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">
              Filter by Category
            </h2>

            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                className={selectedCategory === '' ? 'bg-primary text-white' : ''}
                onClick={() => setSelectedCategory('')}
              >
                All Categories
              </Button>

              {categoryOptions.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={selectedCategory === category ? 'bg-primary text-white' : ''}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              Showing {paginatedItems.length} of {filteredItems.length} image
              {filteredItems.length === 1 ? '' : 's'}
              {selectedCategory ? ` from ${selectedCategory}` : ' from all categories'}.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            {loading ? (
              <div className="py-16 text-center text-muted-foreground">
                Loading gallery...
              </div>
            ) : error ? (
              <div className="py-16 text-center text-red-500">
                {error}
              </div>
            ) : paginatedItems.length === 0 ? (
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
                        onClick={() => openImage(index)}
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
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-muted-foreground px-2">
                      Page {Math.min(currentPage, totalPages)} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

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

              {paginatedItems.length > 1 && (
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
                {paginatedItems.map((item, index) => {
                  const isActive = index === selectedImageIndex;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedImageIndex(index)}
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

      <Footer />
    </>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <GalleryPageContent />
    </Suspense>
  );
}