'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { TrekCard } from '@/components/trek-card';
import { treks } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { getTreks } from '@/lib/api';

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

  useEffect(() => {
    const loadTreks = async () => {
      const apiTreks = await getTreks();
      if (apiTreks.length > 0) {
        setTrekList(apiTreks);
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
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
        <section className="py-6 md:py-8 border-b border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-4"
            >
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">Filter Treks</h2>
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
              >
                <motion.div variants={itemVariants}>
                  <select
                    value={selectedRegion}
                    onChange={(e) => updateFilters({ region: e.target.value })}
                    className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm text-foreground"
                  >
                    <option value="">All Regions</option>
                    {regionOptions.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => updateFilters({ difficulty: e.target.value })}
                    className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm text-foreground"
                  >
                    <option value="">All Difficulty Levels</option>
                    {difficultyOptions.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <select
                    value={selectedDuration}
                    onChange={(e) => updateFilters({ duration: e.target.value })}
                    className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm text-foreground"
                  >
                    <option value="">All Durations</option>
                    <option value="short">Up to 10 days</option>
                    <option value="medium">11–14 days</option>
                    <option value="long">15+ days</option>
                  </select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <select
                    value={selectedSeason}
                    onChange={(e) => updateFilters({ season: e.target.value })}
                    className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm text-foreground"
                  >
                    <option value="">All Travel Seasons</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="autumn">Autumn</option>
                    <option value="winter">Winter</option>
                  </select>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  variant="outline"
                  className="h-9"
                  onClick={() => updateFilters({ region: '', difficulty: '', duration: '', season: '' })}
                >
                  Reset Filters
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Treks Grid */}
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.p variants={itemVariants} className="text-base text-muted-foreground mb-6">
                Showing {filteredTreks.length} trek{filteredTreks.length !== 1 ? 's' : ''}
              </motion.p>
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {filteredTreks.map((trek) => (
                  <motion.div key={trek.id} variants={itemVariants}>
                    <TrekCard trek={trek} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
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
