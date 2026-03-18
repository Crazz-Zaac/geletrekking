'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-accent/10 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="space-y-8 text-center"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Ready to start your Himalayan adventure?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of trekkers who have experienced the magic of Nepal's mountains with our expert guides
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/destinations">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Explore Destinations
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                Contact Us Today
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
