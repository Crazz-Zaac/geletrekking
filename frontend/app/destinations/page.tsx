'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { TrekCard } from '@/components/trek-card';
import { AnnouncementBanner } from '@/components/announcement-banner';
import { treks } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { getTreks } from '@/lib/api';
import { SlidersHorizontal, X, Scale } from 'lucide-react';

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

function DestinationsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [trekList, setTrekList] = useState(treks);
  const [isLoadingTreks, setIsLoadingTreks] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    const loadTreks = async () => {
      try {
        const apiTreks = await getTreks();
        if (apiTreks.length > 0) {
          setTrekList(apiTreks);
        }
      } finally {
        setIsLoadingTreks(false);
      }
    };

    void loadTreks();
  }, []);

  const normalizeRegion = (value: string | null) => {
    if (!value) return '';
    const normalized = value.toLowerCase().replace(' region', '').trim();
    const match = trekList.find((trek) => {
      const region = trek.region.toLowerCase();
      return region === normalized || region.includes(normalized);
    });
    return match?.region || '';
  };

  const getSeasonsFromBestSeason = (bestSeason: string) => {
    const text = bestSeason.toLowerCase();
    const seasons = new Set<string>();

    if (/mar|apr|may|spring/.test(text)) seasons.add('spring');
    if (/jun|jul|aug|summer/.test(text)) seasons.add('summer');
    if (/sep|oct|nov|autumn|fall/.test(text)) seasons.add('autumn');
    if (/dec|jan|feb|winter/.test(text)) seasons.add('winter');

    return seasons;
  };

  const selectedRegion = normalizeRegion(searchParams.get('region'));
  const selectedDifficulty = searchParams.get('difficulty') ?? '';
  const selectedDuration = searchParams.get('duration') ?? '';
  const selectedSeason = (searchParams.get('season') ?? '').toLowerCase();
  const selectedSort = searchParams.get('sort') ?? 'popularity';

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const matchesDuration = (duration: number) => {
    if (!selectedDuration) return true;
    if (selectedDuration === 'short') return duration <= 10;
    if (selectedDuration === 'medium') return duration >= 11 && duration <= 14;
    if (selectedDuration === 'long') return duration >= 15;
    return true;
  };

  const filteredTreks = trekList.filter((trek) => {
    const regionMatch = selectedRegion ? trek.region === selectedRegion : true;
    const difficultyMatch = selectedDifficulty ? trek.difficulty === selectedDifficulty : true;
    const durationMatch = matchesDuration(trek.duration);
    const seasonMatch = selectedSeason ? getSeasonsFromBestSeason(trek.bestSeason).has(selectedSeason) : true;

    return regionMatch && difficultyMatch && durationMatch && seasonMatch;
  });

  const regionOptions = useMemo(
    () => Array.from(new Set(trekList.map((trek) => trek.region))),
    [trekList]
  );

  const difficultyOptions = useMemo(
    () => Array.from(new Set(trekList.map((trek) => trek.difficulty))),
    [trekList]
  );

  const sortedTreks = useMemo(() => {
    const items = [...filteredTreks];

    switch (selectedSort) {
      case 'priceAsc':
        return items.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return items.sort((a, b) => b.price - a.price);
      case 'durationAsc':
        return items.sort((a, b) => a.duration - b.duration);
      case 'difficultyAsc': {
        const order = { Easy: 0, Moderate: 1, Strenuous: 2, Challenging: 3 } as const;
        return items.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
      }
      case 'popularity':
      default:
        return items.sort((a, b) => {
          const aScore = (a.isFeatured ? 2 : 0) + (a.hasOffer ? 1 : 0);
          const bScore = (b.isFeatured ? 2 : 0) + (b.hasOffer ? 1 : 0);
          return bScore - aScore;
        });
    }
  }, [filteredTreks, selectedSort]);

  const suggestedTreks = useMemo(() => {
    const featured = trekList.filter((trek) => trek.isFeatured);
    if (featured.length >= 3) return featured.slice(0, 3);
    return trekList.slice(0, 3);
  }, [trekList]);

  const activeFilters = [
    selectedRegion
      ? { key: 'region', label: 'Region', value: selectedRegion }
      : null,
    selectedDifficulty
      ? { key: 'difficulty', label: 'Difficulty', value: selectedDifficulty }
      : null,
    selectedDuration
      ? {
          key: 'duration',
          label: 'Duration',
          value:
            selectedDuration === 'short'
              ? 'Up to 10 days'
              : selectedDuration === 'medium'
              ? '11–14 days'
              : '15+ days',
        }
      : null,
    selectedSeason
      ? {
          key: 'season',
          label: 'Season',
          value: selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1),
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>;

  const clearAllFilters = () => {
    updateFilters({ region: '', difficulty: '', duration: '', season: '', sort: 'popularity' });
  };

  const handleToggleCompare = (trekId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(trekId)) {
        return prev.filter((id) => id !== trekId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, trekId];
    });
  };

  const comparedTreks = compareIds
    .map((id) => trekList.find((trek) => trek.id === id))
    .filter((trek): trek is typeof trekList[number] => Boolean(trek));

  const renderFilterControls = (isMobile = false) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <select
        value={selectedRegion}
        onChange={(e) => updateFilters({ region: e.target.value })}
        className="w-full h-11 px-3 rounded-md border border-border bg-background text-sm text-foreground"
      >
        <option value="">All Regions</option>
        {regionOptions.map((region) => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>

      <select
        value={selectedDifficulty}
        onChange={(e) => updateFilters({ difficulty: e.target.value })}
        className="w-full h-11 px-3 rounded-md border border-border bg-background text-sm text-foreground"
      >
        <option value="">All Difficulty Levels</option>
        {difficultyOptions.map((difficulty) => (
          <option key={difficulty} value={difficulty}>{difficulty}</option>
        ))}
      </select>

      <select
        value={selectedDuration}
        onChange={(e) => updateFilters({ duration: e.target.value })}
        className="w-full h-11 px-3 rounded-md border border-border bg-background text-sm text-foreground"
      >
        <option value="">All Durations</option>
        <option value="short">Up to 10 days</option>
        <option value="medium">11–14 days</option>
        <option value="long">15+ days</option>
      </select>

      <select
        value={selectedSeason}
        onChange={(e) => updateFilters({ season: e.target.value })}
        className="w-full h-11 px-3 rounded-md border border-border bg-background text-sm text-foreground"
      >
        <option value="">All Travel Seasons</option>
        <option value="spring">Spring</option>
        <option value="summer">Summer</option>
        <option value="autumn">Autumn</option>
        <option value="winter">Winter</option>
      </select>

      {isMobile ? (
        <Button
          variant="outline"
          className="h-11 md:hidden"
          onClick={() => {
            clearAllFilters();
            setIsMobileFiltersOpen(false);
          }}
        >
          Reset Filters
        </Button>
      ) : null}
    </div>
  );

  const queryAnimationKey = `${selectedRegion}-${selectedDifficulty}-${selectedDuration}-${selectedSeason}-${selectedSort}`;

  return (
    <>
      <Navbar />
      <div className="pt-16">
        <AnnouncementBanner />
        <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-10 md:py-14 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-3 text-center"
            >
              <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                Explore Our Treks
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
              >
                Choose from our complete collection of incredible trekking adventures across Nepal
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-16 z-30 py-4 md:py-5 border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">Filter Treks</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-11 hidden md:inline-flex"
                    onClick={clearAllFilters}
                  >
                    Reset Filters
                  </Button>

                  <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="h-11 md:hidden gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {activeFilters.length > 0 ? (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
                            {activeFilters.length}
                          </span>
                        ) : null}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="max-h-[80vh] rounded-t-2xl">
                      <SheetHeader>
                        <SheetTitle>Filter Treks</SheetTitle>
                        <SheetDescription>Refine treks by region, difficulty, duration, and season.</SheetDescription>
                      </SheetHeader>
                      <div className="px-4 pb-6 space-y-4 overflow-y-auto">
                        {renderFilterControls(true)}
                        <Button className="h-11 w-full" onClick={() => setIsMobileFiltersOpen(false)}>
                          Apply Filters
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              <div className="hidden md:block">
                {renderFilterControls(false)}
              </div>

              {activeFilters.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {activeFilters.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => updateFilters({ [filter.key]: '' })}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80"
                    >
                      {filter.label}: {filter.value}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                  <Button variant="ghost" className="h-8 px-2 text-xs" onClick={clearAllFilters}>
                    Clear all
                  </Button>
                </div>
              ) : null}
            </motion.div>
          </div>
        </section>

        {/* Treks Grid */}
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <p className="text-base text-muted-foreground">
                Showing {sortedTreks.length} trek{sortedTreks.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="sort-treks" className="text-sm text-muted-foreground">Sort by</label>
                <select
                  id="sort-treks"
                  value={selectedSort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="h-11 rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="popularity">Popularity</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="durationAsc">Duration: Shortest First</option>
                  <option value="difficultyAsc">Difficulty: Easy to Hard</option>
                </select>
              </div>
            </div>

            {comparedTreks.length > 0 ? (
              <div className="mb-6 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Scale className="h-4 w-4" />
                    Compare Treks ({comparedTreks.length}/3)
                  </div>
                  <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => setCompareIds([])}>
                    Clear compare
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {comparedTreks.map((trek) => (
                    <div key={trek.id} className="rounded-lg border border-border p-3 bg-background">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-foreground line-clamp-1">{trek.title}</h4>
                        <button
                          className="text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => handleToggleCompare(trek.id)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>Difficulty: <span className="text-foreground">{trek.difficulty}</span></p>
                        <p>Duration: <span className="text-foreground">{trek.duration} days</span></p>
                        <p>Max altitude: <span className="text-foreground">{trek.maxAltitude.toLocaleString()}m</span></p>
                        <p>Price: <span className="text-foreground">From ${trek.price.toLocaleString()}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {isLoadingTreks ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="rounded-2xl border border-border p-4 space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : sortedTreks.length === 0 ? (
              <div className="space-y-8">
                <div className="rounded-2xl border border-border bg-card p-8 text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-2">No treks match your filters</h3>
                  <p className="text-muted-foreground mb-4">Try removing some filters or explore these recommended treks.</p>
                  <Button onClick={clearAllFilters}>Clear Filters</Button>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-4">Suggested Treks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {suggestedTreks.map((trek) => (
                      <TrekCard
                        key={trek.id}
                        trek={trek}
                        isCompared={compareIds.includes(trek.id)}
                        compareDisabled={!compareIds.includes(trek.id) && compareIds.length >= 3}
                        onToggleCompare={handleToggleCompare}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                key={queryAnimationKey}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {sortedTreks.map((trek) => (
                  <TrekCard
                    key={trek.id}
                    trek={trek}
                    isCompared={compareIds.includes(trek.id)}
                    compareDisabled={!compareIds.includes(trek.id) && compareIds.length >= 3}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </section>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default function DestinationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DestinationsPageContent />
    </Suspense>
  );
}
