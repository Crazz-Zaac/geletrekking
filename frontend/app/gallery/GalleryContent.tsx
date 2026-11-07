'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Camera, ChevronLeft, ChevronRight, Loader2, Mail, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type GalleryPhoto = {
  id: string;
  image: string;
  caption: string;
  trekName: string;
  trekSlug: string | null;
  region: string;
  isFeatured: boolean;
};

interface GalleryContentProps {
  photos: GalleryPhoto[];
  heroImageUrl: string;
}

const PAGE_SIZE = 24;

/** Same order everywhere: featured first, then newest (ObjectIds sort by creation time). */
function sortPhotos(photos: GalleryPhoto[]) {
  return [...photos].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.id.localeCompare(a.id)
  );
}

/** Column count for the masonry grid: 2 on phones, 3 on tablets, 4 on wide screens. */
function useColumnCount() {
  const [columns, setColumns] = useState(2);
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1280px)');
    const medium = window.matchMedia('(min-width: 768px)');
    const update = () => setColumns(wide.matches ? 4 : medium.matches ? 3 : 2);
    update();
    wide.addEventListener('change', update);
    medium.addEventListener('change', update);
    return () => {
      wide.removeEventListener('change', update);
      medium.removeEventListener('change', update);
    };
  }, []);
  return columns;
}

function Chip({
  active,
  onClick,
  children,
  small = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        small ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-sm',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5'
      )}
    >
      {children}
    </button>
  );
}

export function GalleryContent({ photos, heroImageUrl }: GalleryContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const columnCount = useColumnCount();

  const allPhotos = useMemo(() => sortPhotos(photos), [photos]);

  // Filters live in the URL so links like /gallery?trek=everest-base-camp work.
  const regionParam = searchParams?.get('region') || '';
  const trekParam = searchParams?.get('trek') || searchParams?.get('category') || '';

  const trekPhotos = useMemo(() => {
    if (!trekParam) return null;
    const wanted = trekParam.toLowerCase();
    return allPhotos.filter(
      (photo) => photo.trekSlug === trekParam || photo.trekName.toLowerCase() === wanted
    );
  }, [allPhotos, trekParam]);

  const activeTrekName = trekPhotos?.[0]?.trekName ?? '';
  const activeRegion = trekPhotos?.[0]?.region ?? regionParam;

  const regions = useMemo(() => {
    const counts = new Map<string, number>();
    allPhotos.forEach((photo) => counts.set(photo.region, (counts.get(photo.region) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => (a[0] === 'Other' ? 1 : b[0] === 'Other' ? -1 : b[1] - a[1]))
      .map(([name, count]) => ({ name, count }));
  }, [allPhotos]);

  const treksInRegion = useMemo(() => {
    if (!activeRegion) return [];
    const counts = new Map<string, { name: string; key: string; count: number }>();
    allPhotos
      .filter((photo) => photo.region === activeRegion)
      .forEach((photo) => {
        const entry = counts.get(photo.trekName) ?? {
          name: photo.trekName,
          key: photo.trekSlug ?? photo.trekName,
          count: 0,
        };
        entry.count += 1;
        counts.set(photo.trekName, entry);
      });
    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  }, [allPhotos, activeRegion]);

  const filtered = useMemo(() => {
    if (trekPhotos) return trekPhotos;
    if (activeRegion) return allPhotos.filter((photo) => photo.region === activeRegion);
    return allPhotos;
  }, [allPhotos, trekPhotos, activeRegion]);

  const setFilter = (next: { region?: string; trek?: string }) => {
    const params = new URLSearchParams();
    if (next.region) params.set('region', next.region);
    if (next.trek) params.set('trek', next.trek);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Progressive loading: 24 at a time as the visitor scrolls.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => setVisibleCount(PAGE_SIZE), [regionParam, trekParam]);
  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: '600px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [filtered.length]);

  const visible = filtered.slice(0, visibleCount);

  // Round-robin into columns keeps the reading order left-to-right and stable while loading more.
  const columns = useMemo(() => {
    const result: Array<Array<{ photo: GalleryPhoto; index: number }>> = Array.from(
      { length: columnCount },
      () => []
    );
    visible.forEach((photo, index) => result[index % columnCount].push({ photo, index }));
    return result;
  }, [visible, columnCount]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const subtitleRegions = regions
    .filter((region) => region.name !== 'Other')
    .slice(0, 4)
    .map((region) => region.name);

  return (
    <>
      <section className="relative overflow-hidden bg-slate-900">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="container relative mx-auto px-4 py-12 md:px-6 md:py-16">
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            <Camera className="h-3.5 w-3.5" />
            From our treks
          </p>
          <h1 className="text-3xl font-bold text-white md:text-5xl">Trek Gallery</h1>
          <p className="mt-2 max-w-xl text-sm text-white/80 md:text-base">
            {allPhotos.length} photos from the trail
            {subtitleRegions.length ? ` across ${subtitleRegions.join(', ')} and beyond` : ''}, taken by
            our guides and trekkers.
          </p>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 md:px-6">
          <div
            className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden"
            role="toolbar"
            aria-label="Filter photos by region"
          >
            <Chip active={!activeRegion} onClick={() => setFilter({})}>
              All
              <span className="text-xs opacity-70">{allPhotos.length}</span>
            </Chip>
            {regions.map((region) => (
              <Chip
                key={region.name}
                active={activeRegion === region.name}
                onClick={() => setFilter({ region: region.name })}
              >
                {region.name}
                <span className="text-xs opacity-70">{region.count}</span>
              </Chip>
            ))}
          </div>

          {activeRegion && treksInRegion.length > 1 ? (
            <div
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden"
              role="toolbar"
              aria-label={`Filter ${activeRegion} photos by trek`}
            >
              <Chip small active={!trekPhotos} onClick={() => setFilter({ region: activeRegion })}>
                All {activeRegion}
              </Chip>
              {treksInRegion.map((trek) => (
                <Chip
                  small
                  key={trek.key}
                  active={activeTrekName === trek.name}
                  onClick={() => setFilter({ region: activeRegion, trek: trek.key })}
                >
                  {trek.name}
                  <span className="opacity-70">{trek.count}</span>
                </Chip>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <section className="py-6 md:py-10">
        <div className="container mx-auto px-4 md:px-6">
          {filtered.length === 0 ? (
            <div className="mx-auto max-w-md py-20 text-center">
              <Camera className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
              <p className="font-semibold text-foreground">No photos for this trek yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;re adding photos after every season. Browse the rest of the gallery in the meantime.
              </p>
              <button
                type="button"
                onClick={() => setFilter({})}
                className="mt-5 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                See all photos
              </button>
            </div>
          ) : (
            <>
              {trekPhotos && activeTrekName ? (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{filtered.length}</span> photos from{' '}
                    <span className="font-semibold text-foreground">{activeTrekName}</span>
                  </p>
                  {trekPhotos[0]?.trekSlug ? (
                    <Link
                      href={`/trek/${trekPhotos[0].trekSlug}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80"
                    >
                      View trek details <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              ) : null}

              <div className="flex items-start gap-2 md:gap-3">
                {columns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex min-w-0 flex-1 flex-col gap-2 md:gap-3">
                    {column.map(({ photo, index }) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setOpenIndex(index)}
                        className="group relative block w-full overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label={`Open photo: ${photo.trekName}${photo.caption ? `, ${photo.caption}` : ''}`}
                      >
                        <Image
                          src={photo.image}
                          alt={`${photo.caption ? `${photo.caption} – ` : ''}${photo.trekName}, ${photo.region} region, Nepal`}
                          width={800}
                          height={600}
                          loading={index < 4 ? 'eager' : 'lazy'}
                          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                          className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3 pt-10 text-left opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/75">
                            {photo.region}
                          </span>
                          <span className="block text-sm font-semibold leading-snug text-white">
                            {photo.trekName}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              <div ref={sentinelRef} aria-hidden="true" />
              {visibleCount < filtered.length ? (
                <div className="flex justify-center py-8">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, filtered.length))}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold hover:bg-muted"
                  >
                    Show more photos
                  </button>
                </div>
              ) : null}
            </>
          )}

          <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-border bg-muted/40 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <p className="text-lg font-semibold text-foreground">Trekked with us?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Send us your favourite shots from the trail and we&apos;ll add them to the gallery with credit.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="mailto:info@geletrekking.com?subject=My%20trek%20photos"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold hover:bg-muted"
              >
                <Mail className="h-4 w-4" />
                Share your photos
              </a>
              <Link
                href="/destinations"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Find your trek
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {openIndex !== null && filtered[openIndex] ? (
        <Lightbox
          photos={filtered}
          index={openIndex}
          onChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </>
  );
}

function Lightbox({
  photos,
  index,
  onChange,
  onClose,
}: {
  photos: GalleryPhoto[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const photo = photos[index];
  const total = photos.length;
  const [loaded, setLoaded] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (step: number) => {
      if (total < 2) return;
      onChange((index + step + total) % total);
    },
    [index, total, onChange]
  );

  useEffect(() => setLoaded(false), [photo.id]);

  // Keyboard, scroll lock and focus return.
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowLeft') go(-1);
      else if (event.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  useEffect(() => {
    const active = stripRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [index]);

  const neighbours = total > 1 ? [photos[(index + 1) % total], photos[(index - 1 + total) % total]] : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${total}: ${photo.trekName}`}
      className="fixed inset-0 z-[70] flex flex-col bg-black/95 text-white"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <p className="text-sm tabular-nums text-white/70" aria-live="polite">
          {index + 1} / {total}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="relative min-h-0 flex-1"
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start) return;
          const touch = event.changedTouches[0];
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
          else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onClose();
        }}
      >
        {!loaded ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white/60" />
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-2 md:inset-x-20 md:inset-y-2">
          <Image
            key={photo.id}
            src={photo.image}
            alt={`${photo.caption ? `${photo.caption} – ` : ''}${photo.trekName}`}
            fill
            priority
            sizes="100vw"
            onLoad={() => setLoaded(true)}
            className={cn('object-contain transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
          />
        </div>
        {/* Warm the cache for the next and previous photos. */}
        <div className="hidden" aria-hidden="true">
          {neighbours.map((item) => (
            <Image key={item.id} src={item.image} alt="" width={1600} height={1200} sizes="100vw" loading="eager" />
          ))}
        </div>

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-3 md:px-6">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white/60">
            <MapPin className="h-3.5 w-3.5" />
            {photo.region}
          </p>
          <p className="truncate text-base font-semibold md:text-lg">{photo.trekName}</p>
          {photo.caption && photo.caption !== photo.trekName ? (
            <p className="truncate text-sm text-white/70">{photo.caption}</p>
          ) : null}
        </div>
        {photo.trekSlug ? (
          <Link
            href={`/trek/${photo.trekSlug}`}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-white/90"
          >
            View this trek
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <div
        ref={stripRef}
        className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            data-active={itemIndex === index}
            onClick={() => onChange(itemIndex)}
            aria-label={`Show photo ${itemIndex + 1}`}
            className={cn(
              'relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition',
              itemIndex === index ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'
            )}
          >
            <Image src={item.image} alt="" fill sizes="80px" loading="lazy" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
