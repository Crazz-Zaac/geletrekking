import { useEffect, useRef, useState } from "react";

interface ItineraryDay {
  day: number;
  title: string;
  description?: string;
  accommodation?: string;
  meals?: string;
  distance_km?: number;
  elevation_gain?: number;
  elevation_loss?: number;
}

interface Props {
  days: ItineraryDay[];
  totalDays?: number;
}

// Day icon based on day number / content keywords
function DayIcon({ day, title }: { day: number; title: string }) {
  const t = (title || "").toLowerCase();
  if (t.includes("arrival") || t.includes("kathmandu") || t.includes("fly"))
    return <span style={{ fontSize: 22 }}>✈️</span>;
  if (t.includes("summit") || t.includes("peak") || t.includes("top"))
    return <span style={{ fontSize: 22 }}>🏔️</span>;
  if (t.includes("camp") || t.includes("base camp"))
    return <span style={{ fontSize: 22 }}>⛺</span>;
  if (t.includes("rest") || t.includes("acclimat"))
    return <span style={{ fontSize: 22 }}>🫁</span>;
  if (t.includes("descend") || t.includes("descent") || t.includes("down"))
    return <span style={{ fontSize: 22 }}>⬇️</span>;
  if (t.includes("depart") || t.includes("farewell") || t.includes("return"))
    return <span style={{ fontSize: 22 }}>🎒</span>;
  if (t.includes("lake") || t.includes("river"))
    return <span style={{ fontSize: 22 }}>💧</span>;
  if (t.includes("forest") || t.includes("jungle"))
    return <span style={{ fontSize: 22 }}>🌲</span>;
  if (t.includes("village") || t.includes("town"))
    return <span style={{ fontSize: 22 }}>🏘️</span>;
  return <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>D{day}</span>;
}

function DayCard({ item, index, isLeft }: { item: ItineraryDay; index: number; isLeft: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
    "linear-gradient(135deg, #fd7043 0%, #ff8a65 100%)",
    "linear-gradient(135deg, #26c6da 0%, #00acc1 100%)",
  ];
  const grad = gradients[index % gradients.length];

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        justifyContent: isLeft ? "flex-end" : "flex-start",
        paddingRight: isLeft ? "calc(50% + 32px)" : "0",
        paddingLeft: isLeft ? "0" : "calc(50% + 32px)",
        marginBottom: "12px",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateX(0)"
          : isLeft
          ? "translateX(-60px)"
          : "translateX(60px)",
        transition: `opacity 0.6s ease ${index * 0.08}s, transform 0.6s cubic-bezier(0.34,1.26,0.64,1) ${index * 0.08}s`,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          maxWidth: "360px",
          width: "100%",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.06)",
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 12px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        {/* Gradient top bar */}
        <div style={{ height: "6px", background: grad }} />

        {/* Card body */}
        <div style={{ padding: "20px 22px 18px" }}>
          {/* Day badge + title */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <div
              style={{
                minWidth: "44px",
                height: "44px",
                borderRadius: "12px",
                background: grad,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                flexShrink: 0,
              }}
            >
              <DayIcon day={item.day} title={item.title} />
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#9ca3af", textTransform: "uppercase" }}>
                Day {item.day}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1f2937", lineHeight: 1.3 }}>
                {item.title}
              </div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, marginBottom: "14px" }}>
              {item.description}
            </p>
          )}

          {/* Stats row */}
          {(item.distance_km || item.elevation_gain || item.elevation_loss) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
              {item.distance_km && (
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "3px 10px",
                  borderRadius: "20px", background: "#eff6ff", color: "#2563eb",
                }}>
                  📍 {item.distance_km} km
                </span>
              )}
              {item.elevation_gain && (
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "3px 10px",
                  borderRadius: "20px", background: "#f0fdf4", color: "#16a34a",
                }}>
                  ↑ {item.elevation_gain}m gain
                </span>
              )}
              {item.elevation_loss && (
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "3px 10px",
                  borderRadius: "20px", background: "#fef2f2", color: "#dc2626",
                }}>
                  ↓ {item.elevation_loss}m loss
                </span>
              )}
            </div>
          )}

          {/* Accommodation + Meals */}
          {(item.accommodation || item.meals) && (
            <div style={{
              display: "flex", gap: "8px", flexWrap: "wrap",
              borderTop: "1px solid #f3f4f6", paddingTop: "12px",
            }}>
              {item.accommodation && (
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#6b7280" }}>
                  <span>🏠</span>
                  <span>{item.accommodation}</span>
                </div>
              )}
              {item.meals && (
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#6b7280" }}>
                  <span>🍽️</span>
                  <span>{item.meals}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Center dot on the timeline
function TimelineDot({ index, total }: { index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "50%",
        marginTop: "-20px",
        zIndex: 2,
        opacity: visible ? 1 : 0,
        scale: visible ? "1" : "0",
        transition: `opacity 0.4s ease ${index * 0.08}s, scale 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.08}s`,
      }}
    >
      <div style={{
        width: isFirst || isLast ? "44px" : "36px",
        height: isFirst || isLast ? "44px" : "36px",
        borderRadius: "50%",
        background: isFirst
          ? "linear-gradient(135deg, #667eea, #764ba2)"
          : isLast
          ? "linear-gradient(135deg, #43e97b, #38f9d7)"
          : "linear-gradient(135deg, #f97316, #ea580c)",
        border: "4px solid #fff",
        boxShadow: "0 0 0 3px rgba(249,115,22,0.2), 0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: isFirst || isLast ? "18px" : "13px",
        fontWeight: 800,
        color: "#fff",
      }}>
        {isFirst ? "🚀" : isLast ? "🏁" : index + 1}
      </div>
    </div>
  );
}

export function ItineraryTimeline({ days, totalDays }: Props) {
  const lineRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate the vertical line on scroll
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const visiblePx = Math.min(windowH - rect.top, rect.height);
      const pct = Math.max(0, Math.min(1, visiblePx / rect.height));
      setLineHeight(pct * 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!days || days.length === 0) return null;

  return (
    <div>
      {/* Header summary */}
      <div style={{
        display: "flex", gap: "16px", flexWrap: "wrap",
        marginBottom: "40px", padding: "20px 24px",
        background: "linear-gradient(135deg, #fff7ed, #fef3c7)",
        borderRadius: "14px", border: "1px solid #fed7aa",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "24px" }}>📅</span>
          <div>
            <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Duration</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937" }}>{totalDays || days.length} Days</div>
          </div>
        </div>
        <div style={{ width: 1, background: "#fed7aa", margin: "0 4px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "24px" }}>🗺️</span>
          <div>
            <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Itinerary</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937" }}>{days.length} Stages</div>
          </div>
        </div>
        {days.some((d) => d.distance_km) && (
          <>
            <div style={{ width: 1, background: "#fed7aa", margin: "0 4px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px" }}>📍</span>
              <div>
                <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Distance</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937" }}>
                  {days.reduce((acc, d) => acc + (d.distance_km || 0), 0)} km
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Timeline */}
      <div ref={containerRef} style={{ position: "relative", padding: "0 0 40px" }}>
        {/* Vertical line track */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: "3px",
          background: "#e5e7eb",
          transform: "translateX(-50%)",
          borderRadius: "2px",
          zIndex: 0,
        }} />
        {/* Animated fill line */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: "3px",
          height: `${lineHeight}%`,
          background: "linear-gradient(to bottom, #667eea, #f97316, #43e97b)",
          transform: "translateX(-50%)",
          borderRadius: "2px",
          zIndex: 1,
          transition: "height 0.1s linear",
        }} />

        {/* Day cards */}
        {days.map((item, index) => (
          <div key={index} style={{ position: "relative", minHeight: "100px" }}>
            <TimelineDot index={index} total={days.length} />
            <DayCard item={item} index={index} isLeft={index % 2 === 0} />
          </div>
        ))}
      </div>

      {/* Mobile: single column fallback via media query hint */}
      <style>{`
        @media (max-width: 640px) {
          .itinerary-card { padding-left: 56px !important; padding-right: 0 !important; justify-content: flex-start !important; }
        }
      `}</style>
    </div>
  );
}
