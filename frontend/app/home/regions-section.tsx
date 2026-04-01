'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Region {
  id: string;
  name: string;
  description: string;
  image: string;
  treksCount: number;
}

interface RegionsSectionProps {
  regions: Region[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function RegionsSection({ regions }: RegionsSectionProps) {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
            Explore Nepal
          </p>
          <h2 className="font-serif text-4xl font-bold text-foreground mb-4 text-balance">
            Trekking Regions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From the world-famous Everest region to the remote valleys of Mustang, discover Nepal's diverse trekking destinations.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {regions.map((region) => (
            <motion.div key={region.id} variants={cardVariants}>
              <Link
                href={`/destinations?region=${region.id}`}
                className="group block relative overflow-hidden rounded-xl aspect-[4/5]"
              >
                <Image
                  src={region.image}
                  alt={region.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-serif text-xl font-bold text-white mb-1">
                    {region.name}
                  </h3>
                  <p className="text-white/80 text-sm mb-2 line-clamp-2">
                    {region.description}
                  </p>
                  {/* <span className="text-primary-foreground/90 bg-primary/80 text-xs px-2 py-1 rounded">
                    {region.treksCount} treks
                  </span> */}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
