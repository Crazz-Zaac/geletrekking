"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/testimonials`
        );
        setTestimonials(res.data || []);
      } catch (err) {
        console.error("Failed to load testimonials", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <div className="min-h-screen bg-brand-light text-brand-secondary py-20 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
        Testimonials
      </h1>
      {loading ? (
        <p className="text-center text-gray-500">Loading testimonials…</p>
      ) : testimonials.length === 0 ? (
        <p className="text-center text-gray-500">No testimonials yet.</p>
      ) : (
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t._id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-lg transition duration-200"
            >
              <div className="flex items-center mb-3">
                <span className="text-brand-gold text-lg mr-1">
                  {"★".repeat(t.rating || 5)}
                </span>
              </div>
              <p className="text-gray-700 italic mb-4">“{t.message}”</p>
              <p className="font-semibold text-brand-secondary">
                {t.name}
                {t.country ? ` — ${t.country}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}