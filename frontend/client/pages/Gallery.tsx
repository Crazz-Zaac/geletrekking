import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxImage, setLightboxImage] = useState<any | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);

  const { data: items, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => (await api.get("/api/gallery")).data,
  });

  const categories = useMemo(() => {
    if (!items) return [];
    const unique = Array.from(
      new Set(items.map((item: any) => item.category).filter((cat: string) => cat && cat.trim()))
    ) as string[];
    return unique.sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (selectedCategory === "all") return items;
    return items.filter((item: any) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const openLightbox = (image: any, imageList: any[], e: React.MouseEvent) => {
    e.stopPropagation();
    const index = imageList.findIndex((item) => item._id === image._id);
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
    const newIndex = (lightboxIndex + 1) % lightboxImages.length;
    setLightboxIndex(newIndex);
    setLightboxImage(lightboxImages[newIndex]);
  };

  const prevImage = () => {
    const newIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    setLightboxIndex(newIndex);
    setLightboxImage(lightboxImages[newIndex]);
  };

  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown as any);
    return () => window.removeEventListener("keydown", handleKeyDown as any);
  });

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Outfit:wght@300;400;500;600&display=swap');

        .gallery-wrap { font-family: 'Outfit', sans-serif; background: #fff; min-height: 100vh; }

        /* ── Hero ── */
        .gallery-hero {
          border-bottom: 2px solid #111;
          padding: 48px 40px 28px;
        }
        .gallery-hero .eyebrow {
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #999;
          margin: 0 0 6px;
        }
        .gallery-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 700;
          color: #111;
          margin: 0 0 10px;
          line-height: 1.05;
        }
        .gallery-hero .subtitle {
          font-size: 15px;
          color: #888;
          font-weight: 300;
          margin: 0;
        }

        /* ── Filters ── */
        .gallery-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 20px 40px;
          border-bottom: 1px solid #e8e8e8;
          background: #fafafa;
        }
        .gallery-filters button {
          padding: 6px 16px;
          border: 1px solid #111;
          background: transparent;
          color: #111;
          cursor: pointer;
          font-size: 12px;
          font-family: 'Outfit', sans-serif;
          text-transform: capitalize;
          letter-spacing: 0.04em;
          transition: background 0.15s, color 0.15s;
        }
        .gallery-filters button:hover { background: #f0f0f0; }
        .gallery-filters button.active { background: #111; color: #fff; }

        /* ── Grid ── */
        .gallery-section { padding: 32px 40px 60px; }
        .gallery-count {
          font-size: 13px;
          color: #999;
          margin-bottom: 20px;
          letter-spacing: 0.02em;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }
        @media (max-width: 768px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr); }
          .gallery-hero, .gallery-filters, .gallery-section { padding-left: 20px; padding-right: 20px; }
        }
        @media (max-width: 480px) {
          .gallery-grid { grid-template-columns: 1fr; }
        }

        /* ── Cards ── */
        .gallery-card {
          position: relative;
          overflow: hidden;
          aspect-ratio: 4/3;
          cursor: pointer;
          background: #f0f0f0;
        }
        .gallery-card img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          transition: transform 0.4s ease;
        }
        .gallery-card:hover img { transform: scale(1.04); }
        .gallery-card .card-caption {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 10px 12px;
          background: rgba(0,0,0,0.55);
          transform: translateY(100%);
          transition: transform 0.25s ease;
        }
        .gallery-card:hover .card-caption { transform: translateY(0); }
        .gallery-card .card-title {
          color: #fff;
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          margin: 0 0 2px;
        }
        .gallery-card .card-cat {
          color: rgba(255,255,255,0.65);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin: 0;
        }
        .featured-badge {
          position: absolute; top: 10px; right: 10px;
          background: #f5c842;
          color: #5a3d00;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 9px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* ── Empty / Loading ── */
        .gallery-empty {
          padding: 80px 0;
          text-align: center;
          color: #aaa;
          font-size: 15px;
          font-weight: 300;
        }
        .gallery-spinner {
          display: inline-block;
          width: 32px; height: 32px;
          border: 3px solid #e0e0e0;
          border-top-color: #111;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Lightbox ── */
        .lightbox-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.96);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lightbox-close {
          position: absolute; top: 20px; right: 20px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff; width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 18px;
          transition: background 0.2s;
        }
        .lightbox-close:hover { background: rgba(255,255,255,0.2); }
        .lightbox-counter {
          position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
          color: rgba(255,255,255,0.8); font-size: 13px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 6px 16px;
          letter-spacing: 0.05em;
        }
        .lightbox-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff; width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s;
        }
        .lightbox-nav:hover { background: rgba(255,255,255,0.2); }
        .lightbox-nav.prev { left: 20px; }
        .lightbox-nav.next { right: 20px; }
        .lightbox-img-wrap {
          position: relative;
          max-width: min(1200px, 90vw);
          max-height: 85vh;
        }
        .lightbox-img-wrap img {
          max-width: 100%; max-height: 85vh;
          object-fit: contain; display: block;
        }
        .lightbox-info {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
          padding: 24px 20px 16px;
        }
        .lightbox-info h3 {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700;
          color: #fff; margin: 0 0 4px;
        }
        .lightbox-info span {
          font-size: 11px; color: rgba(255,255,255,0.55);
          text-transform: uppercase; letter-spacing: 0.12em;
        }
      `}</style>

      <div className="gallery-wrap">

        {/* ── Hero ── */}
        <header className="gallery-hero">
          <p className="eyebrow">Gele Trekking</p>
          <h1>Gallery</h1>
          <p className="subtitle">A curated collection of moments from our adventures</p>
        </header>

        {/* ── Filters ── */}
        {categories.length > 0 && (
          <div className="gallery-filters">
            <button
              className={selectedCategory === "all" ? "active" : ""}
              onClick={() => setSelectedCategory("all")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={selectedCategory === cat ? "active" : ""}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Grid ── */}
        <section className="gallery-section">
          {isLoading ? (
            <div className="gallery-empty">
              <div className="gallery-spinner" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="gallery-empty">
              No moments captured yet{selectedCategory !== "all" ? ` in ${selectedCategory}` : ""}.
            </div>
          ) : (
            <>
              <p className="gallery-count">
                {filteredItems.length} {filteredItems.length === 1 ? "photo" : "photos"}
                {selectedCategory !== "all" && ` · ${selectedCategory}`}
              </p>
              <div className="gallery-grid">
                {filteredItems.map((item: any) => (
                  <div
                    key={item._id}
                    className="gallery-card"
                    onClick={(e) => openLightbox(item, filteredItems, e)}
                  >
                    <img src={item.imageUrl} alt={item.title || "Gallery image"} loading="lazy" />
                    {item.isFeatured && <div className="featured-badge">✦ Featured</div>}
                    <div className="card-caption">
                      {item.title && <p className="card-title">{item.title}</p>}
                      <p className="card-cat">{item.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── Lightbox ── */}
        {lightboxImage && (
          <div className="lightbox-overlay" onClick={closeLightbox}>
            <button className="lightbox-close" onClick={closeLightbox}>✕</button>

            <div className="lightbox-counter">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>

            {lightboxImages.length > 1 && (
              <>
                <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                  <ChevronLeft size={20} />
                </button>
                <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            <div className="lightbox-img-wrap" onClick={(e) => e.stopPropagation()}>
              <img src={lightboxImage.imageUrl} alt={lightboxImage.title || "Gallery image"} />
              {(lightboxImage.title || lightboxImage.category) && (
                <div className="lightbox-info">
                  {lightboxImage.title && <h3>{lightboxImage.title}</h3>}
                  {lightboxImage.category && <span>{lightboxImage.category}</span>}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
