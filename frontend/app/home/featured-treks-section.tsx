'use client';

import { motion } from 'framer-motion';
import { TrekCard } from '@/components/trek-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { treks } from '@/lib/data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function FeaturedTreksSection() {
  const featuredTreks = treks.slice(0, 3);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="space-y-12"
        >
          <motion.div variants={itemVariants} className="space-y-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Featured Treks
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our most popular and breathtaking trekking adventures across the Himalayas
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featuredTreks.map((trek) => (
              <motion.div key={trek.id} variants={itemVariants}>
                <TrekCard trek={trek} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-center pt-8">
            <Link href="/destinations">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                View All Treks
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
