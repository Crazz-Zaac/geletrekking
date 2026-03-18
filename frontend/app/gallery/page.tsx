'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { treks } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

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

  const regionOptions = Array.from(new Set(treks.map((trek) => trek.region)));
  const selectedRegion = searchParams.get('region') ?? '';
  const selectedTrekSlug = searchParams.get('trek') ?? '';
  const pageFromQuery = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const selectedTrek = treks.find((trek) => trek.slug === selectedTrekSlug || trek.id === selectedTrekSlug);

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
  const totalPages = isAllDestinations ? Math.max(1, Math.ceil(galleryItems.length / ITEMS_PER_PAGE)) : 1;
  const currentPage = Number.isNaN(pageFromQuery) ? 1 : Math.min(Math.max(pageFromQuery, 1), totalPages);
  const paginatedItems = isAllDestinations
    ? galleryItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : galleryItems;

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
              <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                Trek Gallery
              </motion.h1>
              <motion.p variants={itemVariants} className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore destination photos and filter images by trekking region or specific package
              </motion.p>
            </motion.div>
          </div>
        </section>

        <section className="py-6 md:py-8 border-b border-border">
          <div className="container mx-auto px-4 md:px-6 space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">Filter by Destination</h2>
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
              Showing {paginatedItems.length} of {galleryItems.length} image{galleryItems.length === 1 ? '' : 's'}
              {selectedTrek ? ` from ${selectedTrek.title}` : selectedRegion ? ` from ${selectedRegion}` : ' from all destinations'}.
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
              {paginatedItems.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <Link href={`/trek/${item.slug}`} className="group block">
                    <article className="overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={`${item.trekTitle} - ${item.region}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">{item.region}</p>
                        <h3 className="text-sm font-bold text-foreground line-clamp-2">{item.trekTitle}</h3>
                      </div>
                    </article>
                  </Link>
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
