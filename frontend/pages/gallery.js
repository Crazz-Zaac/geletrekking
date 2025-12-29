"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/gallery`
        );
        setItems(res.data || []);
      } catch (err) {
        console.error("Failed to load gallery items", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-brand-light text-brand-secondary py-20 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">Gallery</h1>
      {loading ? (
        <p className="text-center text-gray-500">Loading gallery…</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500">No images found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {items.map((item) => (
            <div
              key={item._id}
              className="relative rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-200 group"
            >
              <img
                src={item.imageUrl}
                alt={item.title || "Gallery image"}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {(item.title || item.category) && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2 text-white text-sm">
                  {item.title || item.category}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}