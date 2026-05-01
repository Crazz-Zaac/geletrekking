'use client';

import { useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';

const TALLY_EMBED_URL =
  'https://tally.so/embed/9q6WaX?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';

declare global {
  interface Window {
    Tally?: {
      loadEmbeds?: () => void;
    };
  }
}

export default function BookPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.Tally?.loadEmbeds?.();
    }
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="py-10 md:py-14 bg-gradient-to-br from-primary/15 via-accent/10 to-background border-b border-border">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-semibold text-primary">
              Trek Booking Form
            </p>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-foreground text-balance">Book Your Trek</h1>
            <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              Fill out the form below and our team will confirm availability, pricing, and next steps.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <Card className="border-border p-4 md:p-6 shadow-sm">
              <iframe
                data-tally-src={TALLY_EMBED_URL}
                loading="lazy"
                width="100%"
                height="1858"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Trek booking form"
                className="w-full min-h-[720px]"
              />
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
