'use client';

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useIsAdminRoute } from '@/hooks/use-is-admin-route';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const isAdminRoute = useIsAdminRoute();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // The admin has its own sticky save bar in this corner.
  if (isAdminRoute) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <m.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 hidden p-3 sm:block bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg z-40 transition-colors"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </m.button>
      )}
    </AnimatePresence>
  );
}
