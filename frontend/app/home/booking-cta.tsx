'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 },
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

export function BookingCTA() {
  return (
    <section className="py-14 md:py-16 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center"
        >
          <motion.p
            variants={itemVariants}
            className="text-primary-foreground/80 text-sm font-semibold uppercase tracking-widest mb-3"
          >
            Start Your Journey
          </motion.p>
          <motion.h2
            variants={itemVariants}
            className="font-serif text-3xl md:text-4xl font-bold mb-3 text-balance"
          >
            Ready for Your Himalayan Adventure?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-primary-foreground/80 text-base md:text-lg max-w-2xl mx-auto mb-6"
          >
            Join thousands of adventurers who have discovered Nepal's magic with our expert guides. Book your dream trek today.
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/destinations">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-background text-foreground hover:bg-background/90 font-semibold px-8"
              >
                Browse All Treks
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto border border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 font-semibold px-8"
              >
                Get in Touch
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
