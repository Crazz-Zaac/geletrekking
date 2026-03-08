import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useMemo, useEffect } from "react";

export default function Testimonials() {
  const { data: items, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const response = await api.get("/api/testimonials");
      return response.data;
    },
  });

  useEffect(() => {
    const existing = document.querySelector('script[src="https://elfsightcdn.com/platform.js"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://elfsightcdn.com/platform.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const totalCountries = useMemo(() => {
    if (!items) return 0;
    return new Set(items.map((t: any) => t.country).filter(Boolean)).size;
  }, [items]);

  const totalReviews = items?.length ?? 0;

  const avgRating = useMemo(() => {
    if (!items || items.length === 0) return "0.0";
    return (items.reduce((sum: number, t: any) => sum + (t.rating || 0), 0) / items.length).toFixed(1);
  }, [items]);

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Outfit:wght@300;400;500;600&display=swap');

        .testi-wrap { font-family: 'Outfit', sans-serif; background: #fff; min-height: 100vh; }

        /* ── Hero ── */
        .testi-hero {
          padding: 40px 40px 32px;
          border-bottom: 2px solid #111;
        }
        .testi-hero .eyebrow {
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #999;
          margin-bottom: 8px;
        }
        .testi-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: #111;
          margin-bottom: 8px;
          line-height: 1.1;
        }
        .testi-hero .subtitle {
          font-size: 14px;
          color: #888;
          font-weight: 300;
          max-width: 520px;
          line-height: 1.7;
        }
        .testi-stats {
          display: flex;
          gap: 40px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #ebebeb;
        }
        .testi-stat-val {
          font-size: 24px;
          font-weight: 700;
          color: #111;
        }
        .testi-stat-lbl {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #bbb;
          margin-top: 2px;
        }

        /* ── Cards ── */
        .testi-cards-wrap {
          padding: 28px 40px 32px;
        }
        .testi-section-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #bbb;
          margin-bottom: 16px;
        }
        .testi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          background: #ebebeb;
        }
        @media (max-width: 768px) {
          .testi-grid { grid-template-columns: repeat(2, 1fr); }
          .testi-hero, .testi-cards-wrap, .testi-google { padding-left: 20px; padding-right: 20px; }
        }
        @media (max-width: 480px) {
          .testi-grid { grid-template-columns: 1fr; }
        }

        .testi-card {
          background: #fff;
          padding: 22px;
        }
        .testi-card-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .testi-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 15px;
          flex-shrink: 0;
          overflow: hidden;
        }
        .testi-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .testi-card-name {
          font-weight: 600;
          font-size: 14px;
          color: #111;
        }
        .testi-card-country {
          font-size: 11px;
          color: #bbb;
          margin-top: 1px;
        }
        .testi-stars {
          color: #111;
          font-size: 11px;
          margin-top: 3px;
          letter-spacing: 1px;
        }
        .testi-card-text {
          font-size: 13px;
          color: #666;
          line-height: 1.75;
          font-weight: 300;
        }

        /* ── Empty / Loading ── */
        .testi-empty {
          padding: 60px 0;
          text-align: center;
          color: #bbb;
          font-size: 14px;
          font-weight: 300;
        }
        .testi-spinner {
          display: inline-block;
          width: 28px; height: 28px;
          border: 3px solid #ebebeb;
          border-top-color: #111;
          border-radius: 50%;
          animation: testi-spin 0.7s linear infinite;
        }
        @keyframes testi-spin { to { transform: rotate(360deg); } }

        /* ── Google section ── */
        .testi-google {
          padding: 0 40px 48px;
          border-top: 1px solid #ebebeb;
          margin-top: 2px;
        }
        .testi-google h2 {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: #111;
          margin: 24px 0 5px;
        }
        .testi-google .g-sub {
          font-size: 12px;
          color: #bbb;
          margin-bottom: 18px;
        }
        .testi-g-box {
          border: 1px solid #ebebeb;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .testi-g-logo {
          font-size: 26px;
          font-weight: 800;
          color: #4285F4;
        }
        .testi-g-score {
          font-size: 20px;
          font-weight: 700;
          color: #111;
        }
        .testi-g-label {
          font-size: 11px;
          color: #bbb;
          margin-top: 2px;
        }
      `}</style>

      <div className="testi-wrap">

        {/* ── Hero ── */}
        <header className="testi-hero">
          <p className="eyebrow">Gele Trekking</p>
          <h1>Stories of Adventure</h1>
          <p className="subtitle">
            Hundreds of trekkers from across the globe have trusted Gele Trekking with their Himalayan dreams.
          </p>
          <div className="testi-stats">
            <div>
              <div className="testi-stat-val">{totalReviews || "100+"}</div>
              <div className="testi-stat-lbl">Happy Trekkers</div>
            </div>
            <div>
              <div className="testi-stat-val">{totalCountries || "30+"}</div>
              <div className="testi-stat-lbl">Countries</div>
            </div>
            <div>
              <div className="testi-stat-val">{avgRating || "5.0"} ★</div>
              <div className="testi-stat-lbl">Avg Rating</div>
            </div>
          </div>
        </header>

        {/* ── Review Cards ── */}
        <div className="testi-cards-wrap">
          <p className="testi-section-label">Trekker Reviews</p>

          {isLoading ? (
            <div className="testi-empty">
              <div className="testi-spinner" />
            </div>
          ) : items && items.length > 0 ? (
            <div className="testi-grid">
              {items.map((t: any) => {
                const hasImage = t.image && typeof t.image === "string" && t.image.trim().length > 0;
                return (
                  <div key={t._id} className="testi-card">
                    <div className="testi-card-head">
                      <div className="testi-avatar">
                        {hasImage ? (
                          <img
                            src={t.image}
                            alt={t.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.style.display = "none";
                              (e.currentTarget.parentElement as HTMLElement).innerText = t.name.charAt(0).toUpperCase();
                            }}
                          />
                        ) : (
                          t.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="testi-card-name">{t.name}</div>
                        {t.country && <div className="testi-card-country">📍 {t.country}</div>}
                        <div className="testi-stars">
                          {"★".repeat(Math.min(5, Math.max(0, t.rating)))}
                          {"☆".repeat(Math.max(0, 5 - t.rating))}
                        </div>
                      </div>
                    </div>
                    <p className="testi-card-text">{t.message}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="testi-empty">No testimonials yet. Be the first to share your experience!</div>
          )}
        </div>

        {/* ── Google Reviews ── */}
        <div className="testi-google">
          <h2>What Google Says</h2>
          <p className="g-sub">Real verified reviews from our trekkers on Google.</p>
          <div
            className="elfsight-app-e481a5e4-3a7c-4fdf-8c76-96e38154fd89"
            data-elfsight-app-lazy
          />
        </div>

      </div>
    </Layout>
  );
}
