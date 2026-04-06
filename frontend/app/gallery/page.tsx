'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { treks } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Suspense, useMemo, useState } from 'react';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const regionOptions = Array.from(new Set(treks.map((trek) => trek.region)));
  const selectedRegion = searchParams.get('region') ?? '';
  const selectedTrekSlug = searchParams.get('trek') ?? '';
  const pageFromQuery = Number.parseInt(searchParams.get('page') ?? '1', 10);

  const selectedTrek = treks.find(
    (trek) => trek.slug === selectedTrekSlug || trek.id === selectedTrekSlug
  );

  const updateRegion = (region: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!region) {
      params.delete('region');
    } else {
      params.set('region', region);
    }

    params.delete('trek');
    params.delete('page');

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const filteredTreks = selectedTrek
    ? [selectedTrek]
    : selectedRegion
      ? treks.filter((trek) => trek.region === selectedRegion)
      : treks;

  const galleryItems = filteredTreks.flatMap((trek) =>
    (trek.gallery.length > 0 ? trek.gallery : [trek.image]).map((image, index) => ({
      id: `${trek.id}-${index}`,
      image,
      trekTitle: trek.title,
      region: trek.region,
      trekId: trek.id,
      slug: trek.slug,
    }))
  );

  const isAllDestinations = selectedRegion === '' && !selectedTrek;
  const totalPages = isAllDestinations
    ? Math.max(1, Math.ceil(galleryItems.length / ITEMS_PER_PAGE))
    : 1;

  const currentPage = Number.isNaN(pageFromQuery)
    ? 1
    : Math.min(Math.max(pageFromQuery, 1), totalPages);

  const paginatedItems = isAllDestinations
    ? galleryItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : galleryItems;

  const modalItems = useMemo(() => paginatedItems, [paginatedItems]);

  const selectedImage =
    selectedImageIndex !== null ? modalItems[selectedImageIndex] : null;

  const openImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const showPrev = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex(
      selectedImageIndex === 0 ? modalItems.length - 1 : selectedImageIndex - 1
    );
  };

  const showNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex(
      selectedImageIndex === modalItems.length - 1 ? 0 : selectedImageIndex + 1
    );
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-16">
        <section className="py-10 md:py-14 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-3 text-center"
            >
              <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-5xl font-bold text-foreground text-balance"
              >
                Trek Gallery
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
              >
                Explore destination photos and filter images by trekking region or specific package
              </motion.p>
            </motion.div>
          </div>
        </section>

        <section className="py-6 md:py-8 border-b border-border">
          <div className="container mx-auto px-4 md:px-6 space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">
              Filter by Destination
            </h2>

            {selectedTrek && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
                <p className="text-sm text-foreground">
                  Showing package gallery: <span className="font-semibold">{selectedTrek.title}</span>
                </p>
                <Button variant="outline" onClick={() => router.replace('/gallery')}>
                  Show All
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                variant={isAllDestinations ? 'default' : 'outline'}
                className={isAllDestinations ? 'bg-primary text-white' : ''}
                onClick={() => updateRegion('')}
              >
                All Destinations
              </Button>

              {regionOptions.map((region) => (
                <Button
                  key={region}
                  variant={selectedRegion === region ? 'default' : 'outline'}
                  className={selectedRegion === region ? 'bg-primary text-white' : ''}
                  onClick={() => updateRegion(region)}
                >
                  {region}
                </Button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              Showing {paginatedItems.length} of {galleryItems.length} image
              {galleryItems.length === 1 ? '' : 's'}
              {selectedTrek
                ? ` from ${selectedTrek.title}`
                : selectedRegion
                  ? ` from ${selectedRegion}`
                  : ' from all destinations'}
              .
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
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

            {isAllDestinations && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => updatePage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => updatePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90"
          onClick={closeModal}
        >
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

              {modalItems.length > 1 && (
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
                {modalItems.map((item, index) => {
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