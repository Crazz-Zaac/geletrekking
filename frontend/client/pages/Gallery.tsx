import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useState, useMemo, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxImage,     setLightboxImage]    = useState<any | null>(null);
  const [lightboxIndex,     setLightboxIndex]    = useState<number>(0);
  const [lightboxImages,    setLightboxImages]   = useState<any[]>([]);

  const { data: items, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => (await api.get("/api/gallery")).data,
  });

  const categories = useMemo(() => {
    if (!items) return [];
    return (
      Array.from(
        new Set(items.map((item: any) => item.category).filter((c: string) => c?.trim()))
      ) as string[]
    ).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (selectedCategory === "all") return items;
    return items.filter((item: any) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const openLightbox = (image: any, imageList: any[], e: React.MouseEvent) => {
    e.stopPropagation();
    const index = imageList.findIndex((i) => i._id === image._id);
    setLightboxImage(image);
    setLightboxImages(imageList);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxImages([]);
    setLightboxIndex(0);
  };

  const nextImage = () => {
    const i = (lightboxIndex + 1) % lightboxImages.length;
    setLightboxIndex(i);
    setLightboxImage(lightboxImages[i]);
  };

  const prevImage = () => {
    const i = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    setLightboxIndex(i);
    setLightboxImage(lightboxImages[i]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      if (e.key === "Escape")      closeLightbox();
      if (e.key === "ArrowRight")  nextImage();
      if (e.key === "ArrowLeft")   prevImage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxImage, lightboxIndex, lightboxImages]);

  return (
    <Layout>
      <div className="bg-background min-h-screen">

        {/* ── HERO ──────────────────────────────────────────────── */}
        <header className="border-b-2 border-foreground pt-12 pb-7 px-6 md:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-1.5">
            Gele Trekking
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-2">
            Gallery
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            A curated collection of moments from our adventures
          </p>
        </header>

        {/* ── FILTERS ───────────────────────────────────────────── */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-6 md:px-10 py-5 border-b border-border bg-muted/20">
            <button
              onClick={() => setSelectedCategory("all")}
              className="px-4 py-1.5 border border-foreground text-xs font-medium capitalize tracking-wide transition-colors cursor-pointer"
              style={{
                background: selectedCategory === "all" ? "var(--color-foreground)" : "transparent",
                color:      selectedCategory === "all" ? "var(--color-background)" : "var(--color-foreground)",
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-1.5 border border-foreground text-xs font-medium capitalize tracking-wide transition-colors cursor-pointer"
                style={{
                  background: selectedCategory === cat ? "var(--color-foreground)" : "transparent",
                  color:      selectedCategory === cat ? "var(--color-background)" : "var(--color-foreground)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── GRID ──────────────────────────────────────────────── */}
        <section className="px-6 md:px-10 py-8 pb-16">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-border border-t-foreground animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm font-light">
              No moments captured yet{selectedCategory !== "all" ? ` in ${selectedCategory}` : ""}.
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-5 tracking-wide">
                {filteredItems.length} {filteredItems.length === 1 ? "photo" : "photos"}
                {selectedCategory !== "all" && ` · ${selectedCategory}`}
              </p>

              {/* tight 2px-gap grid same as file 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
                {filteredItems.map((item: any) => (
                  <div
                    key={item._id}
                    className="relative overflow-hidden aspect-[4/3] cursor-pointer bg-muted group"
                    onClick={(e) => openLightbox(item, filteredItems, e)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title || "Gallery image"}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Featured badge */}
                    {item.isFeatured && (
                      <div className="absolute top-2.5 right-2.5 bg-accent text-accent-foreground text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide">
                        ✦ Featured
                      </div>
                    )}

                    {/* Caption on hover */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 bg-black/55 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      {item.title && (
                        <p className="text-white text-sm font-bold leading-snug mb-0.5 line-clamp-1">
                          {item.title}
                        </p>
                      )}
                      {item.category && (
                        <p className="text-white/60 text-[10px] uppercase tracking-[0.12em]">
                          {item.category}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── LIGHTBOX ──────────────────────────────────────────── */}
        {lightboxImage && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/80 text-xs border border-white/15 bg-white/10 px-4 py-1.5 tracking-wide">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>

            {/* Prev */}
            {lightboxImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Next */}
            {lightboxImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Image */}
            <div
              className="relative max-w-[90vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage.imageUrl}
                alt={lightboxImage.title || "Gallery image"}
                className="max-w-full max-h-[85vh] object-contain block"
              />

              {/* Caption */}
              {(lightboxImage.title || lightboxImage.category) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-5 pt-10 pb-4">
                  {lightboxImage.title && (
                    <h3 className="text-white text-xl font-bold mb-1">{lightboxImage.title}</h3>
                  )}
                  {lightboxImage.category && (
                    <span className="text-white/55 text-[11px] uppercase tracking-[0.12em]">
                      {lightboxImage.category}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
