"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

/**
 * Home page
 *
 * This component implements a landing page inspired by the provided TrekWays
 * design. It fetches featured trek packages from the backend and lays out
 * several sections: a hero banner, reasons to choose GeleTrekking, featured
 * destinations, an inspirational gallery, company stats, testimonials, social
 * links, a call‑to‑action block and a footer. Tailwind utility classes
 * combined with a custom colour palette defined in `tailwind.config.mjs`
 * provide the look and feel. Emoji icons are used for simplicity – these
 * could be swapped for inline SVGs or an icon library if desired.
 */
export default function HomePage() {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trek packages on mount
  useEffect(() => {
    const loadTreks = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/treks`
        );
        setTreks(res.data || []);
      } catch (err) {
        console.error("Error loading treks:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTreks();
  }, []);

  // Reasons to choose GeleTrekking
  const features = [
    {
      icon: "🏔️",
      title: "Expert Guides",
      desc:
        "Professional guides with decades of experience leading treks across the world.",
    },
    {
      icon: "🤝",
      title: "Community",
      desc:
        "Join a community of passionate adventurers and explore together.",
    },
    {
      icon: "🌍",
      title: "Diverse Destinations",
      desc:
        "Choose from hundreds of carefully curated trek packages worldwide.",
    },
  ];

  // Company statistics to display in the experience section
  const stats = [
    { number: "25+", label: "Years Of Experiences" },
    { number: "60+", label: "Best Destinations" },
    { number: "3,210+", label: "Satisfied Trekkers" },
    { number: "40+", label: "Countries of International Trekkers" },
  ];

  // Static testimonials (could be fetched from backend in future)
  const testimonials = [
    {
      quote:
        "The Everest Base Camp trek was life‑changing! The guides were knowledgeable and the experience unforgettable.",
      author: "Sarah Johnson",
    },
    {
      quote:
        "Kilimanjaro was the adventure of a lifetime. Every moment was worth it. Highly recommend!",
      author: "Marco Rossi",
    },
    {
      quote:
        "The Machu Picchu trail exceeded all expectations. The team made it magical and safe.",
      author: "Elena García",
    },
  ];

  return (
    <div className="bg-brand-light text-brand-secondary">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center text-center overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1509644851193-85309e4bba2b?auto=format&fit=crop&w=1600&q=80"
          alt="Mountain landscape"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-gradientStart/70 to-brand-gradientEnd/90 z-0" />
        {/* Content */}
        <div className="relative z-10 px-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-md">
            Explore the World, One Trail at a Time
          </h1>
          <p className="text-lg md:text-xl text-gray-100 mb-6 drop-shadow-md">
            Embark on unforgettable journeys through breathtaking landscapes. Discover nature's wonders with expert guides and fellow adventurers.
          </p>
          <Link href="/trek" className="inline-block bg-brand-primary text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-brand-primary/90 transition">
            Explore Destinations
          </Link>
        </div>
        {/* Scroll hint */}
        <div className="absolute bottom-8 text-white hidden md:block">
          <span className="animate-bounce">Scroll to explore ↓</span>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-4">
            Why Choose GeleTrekking?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            We go beyond the typical trekking experience by focusing on expert guidance, community connection and a wide variety of destinations to suit every adventurer.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-200"
              >
                <div className="text-5xl mb-4">{feat.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-brand-secondary">
                  {feat.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-brand-secondary mb-8">
            Featured Destinations
          </h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading trek packages…</p>
          ) : treks.length === 0 ? (
            <p className="text-center text-gray-500">No trek packages available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {treks.slice(0, 3).map((trek) => (
                <Link
                  href={`/trek/${trek._id}`}
                  key={trek._id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-200 flex flex-col"
                >
                  <div className="relative h-48">
                    <img
                      src={
                        trek.featuredImage ||
                        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={trek.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {trek.difficulty && (
                      <span className="absolute top-2 left-2 bg-brand-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {trek.difficulty}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-brand-secondary mb-1">
                        {trek.name}
                      </h3>
                      <p className="text-brand-gold font-bold text-sm">
                        {trek.offer?.isActive
                          ? `Rs. ${trek.offer.discountedPrice} (Offer)`
                          : `Rs. ${trek.price}`}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-brand-secondary/70 truncate">
                      {trek.overview?.slice(0, 100) || ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link
              href="/trek"
              className="inline-block bg-brand-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-primary/90 transition"
            >
              View All Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Stunning Destinations (Gallery) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-8">
            Stunning Destinations
          </h2>
          {loading || treks.length === 0 ? (
            <p className="text-gray-500">Get inspired by our most breathtaking trek destinations.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {treks.slice(3, 6).map((trek) => (
                <Link
                  href={`/trek/${trek._id}`}
                  key={trek._id}
                  className="relative h-56 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-200 group"
                >
                  <img
                    src={
                      trek.featuredImage ||
                      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={trek.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-4 left-4 text-white text-left">
                    <h3 className="text-xl font-semibold drop-shadow">
                      {trek.name}
                    </h3>
                    <p className="text-sm text-gray-200 drop-shadow">
                      {trek.duration_days || 0} days
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              href="/gallery"
              className="inline-block bg-brand-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-primary/90 transition"
            >
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 bg-gradient-to-r from-brand-gradientStart to-brand-gradientEnd text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Experience</h2>
          <p className="max-w-3xl mx-auto text-lg text-white/90 mb-10">
            Join thousands of adventurers who have discovered the world's most beautiful destinations with us.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-bold">
                  {stat.number}
                </span>
                <span className="mt-2 text-sm md:text-base font-medium text-white/90 text-center">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-8">
            What Our Adventurers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Real stories from people who've explored the world with us.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="bg-brand-light border border-gray-100 rounded-xl p-6 shadow hover:shadow-lg transition duration-200 text-left"
              >
                <div className="flex items-center mb-3">
                  <span className="text-brand-gold text-xl mr-1">★★★★★</span>
                </div>
                <p className="text-gray-700 italic mb-4">“{t.quote}”</p>
                <p className="font-semibold text-brand-secondary">{t.author}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/testimonials"
              className="inline-block bg-brand-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-primary/90 transition"
            >
              Read More Reviews
            </Link>
          </div>
        </div>
      </section>

      {/* Social / Follow Section */}
      <section className="py-16 bg-brand-light">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-6">
            Follow Our Adventures
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            Stay connected with us on social media to see stunning photos, trek updates and travel tips.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {/* Social buttons with placeholder icons */}
            <a
              href="#"
              className="flex items-center justify-center w-40 h-12 bg-[#1877F2] text-white font-medium rounded-full hover:opacity-90 transition"
            >
              Facebook
            </a>
            <a
              href="#"
              className="flex items-center justify-center w-40 h-12 bg-[#E4405F] text-white font-medium rounded-full hover:opacity-90 transition"
            >
              Instagram
            </a>
            <a
              href="#"
              className="flex items-center justify-center w-40 h-12 bg-[#1DA1F2] text-white font-medium rounded-full hover:opacity-90 transition"
            >
              Twitter
            </a>
            <a
              href="#"
              className="flex items-center justify-center w-40 h-12 bg-[#0077B5] text-white font-medium rounded-full hover:opacity-90 transition"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-brand-gradientStart to-brand-gradientEnd text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-lg md:text-xl mb-8">
            Browse our curated collection of treks and book your unforgettable journey today.
          </p>
          <Link
            href="/trek"
            className="inline-block bg-brand-primary text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-brand-primary/90 transition"
          >
            Start Exploring
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">GeleTrekking</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Explore the world, one trail at a time. Experience breathtaking adventures with expert guides.
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/destinations" className="hover:text-white">Destinations</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white">Gallery</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white">Blog</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">Contact</Link>
              </li>
            </ul>
          </div>
          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white">About Us</Link>
              </li>
              <li>
                <Link href="/activities" className="hover:text-white">Activities</Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-white">Testimonials</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact &amp; Follow</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: info@geletrekking.com</li>
              <li>Phone: +1 (555) 123‑4567</li>
              <li className="flex gap-3 mt-2">
                <a href="#" className="hover:text-white">Facebook</a>
                <a href="#" className="hover:text-white">Instagram</a>
                <a href="#" className="hover:text-white">Twitter</a>
                <a href="#" className="hover:text-white">LinkedIn</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} GeleTrekking. All rights reserved.
        </div>
      </footer>
    </div>
  );
}