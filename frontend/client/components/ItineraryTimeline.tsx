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

// ── Animate in on scroll ──────────────────────────────────────
function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible, delay };
}

// ── Single animated day row ───────────────────────────────────
function DayRow({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: ItineraryDay;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { ref, visible, delay } = useFadeIn(index * 60);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        padding: "22px 0 22px 88px",
        borderBottom: "1px solid #f0ede8",
        cursor: "pointer",
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.5s ease ${index * 60}ms, transform 0.5s ease ${index * 60}ms`,
      }}
    >
      {/* Giant watermark number */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: -10,
          top: "50%",
          transform: "translateY(-50%)",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 100,
          lineHeight: 1,
          color: isOpen || hovered ? "#e8e2db" : "#f5f3f0",
          transition: "color 0.25s ease",
          userSelect: "none",
          pointerEvents: "none",
          letterSpacing: "-0.02em",
        }}
      >
        {item.day}
      </div>

      {/* Content */}
      <div>
        {/* Label + title row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#c4b49a",
                display: "block",
                marginBottom: 3,
              }}
            >
              Day {item.day}
            </span>
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 17,
                fontWeight: 700,
                color: isOpen ? "#1a1208" : hovered ? "#2d1f0e" : "#1a1208",
                lineHeight: 1.2,
                transition: "color 0.2s",
              }}
            >
              {item.title}
            </span>
          </div>

          {/* Right meta + chevron */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            {item.distance_km && (
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 12,
                  color: "#c4b49a",
                  fontWeight: 600,
                }}
              >
                {item.distance_km} km
              </span>
            )}
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: `1.5px solid ${isOpen ? "#1a1208" : "#ddd"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            >
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.25s ease",
                }}
              >
                <polyline points="1,2 4,6 7,2" fill="none" stroke={isOpen ? "#1a1208" : "#bbb"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Expanded panel */}
        <div
          style={{
            display: "grid",
            gridTemplateRows: isOpen ? "1fr" : "0fr",
            transition: "grid-template-rows 0.3s ease",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <div style={{ paddingTop: 14 }}>
              {item.description && (
                <p
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#7a6a56",
                    lineHeight: 1.75,
                    margin: "0 0 14px",
                    maxWidth: 480,
                  }}
                >
                  {item.description}
                </p>
              )}

              {/* Stat pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {item.elevation_gain && (
                  <span style={pillStyle("#f0fdf4", "#15803d")}>
                    ↑ {item.elevation_gain}m gain
                  </span>
                )}
                {item.elevation_loss && (
                  <span style={pillStyle("#fef2f2", "#b91c1c")}>
                    ↓ {item.elevation_loss}m loss
                  </span>
                )}
                {item.accommodation && (
                  <span style={pillStyle("#f8f6f2", "#92816a")}>
                    🏠 {item.accommodation}
                  </span>
                )}
                {item.meals && (
                  <span style={pillStyle("#fffbf0", "#a16207")}>
                    🍽 {item.meals}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function pillStyle(bg: string, color: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 12px",
    borderRadius: 100,
    background: bg,
    color,
    fontSize: 12,
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 600,
  };
}

// ── Summary bar ───────────────────────────────────────────────
function SummaryBar({ days, totalDays }: { days: ItineraryDay[]; totalDays?: number }) {
  const totalDist = days.reduce((a, d) => a + (d.distance_km || 0), 0);
  const totalGain = days.reduce((a, d) => a + (d.elevation_gain || 0), 0);
  const totalLoss = days.reduce((a, d) => a + (d.elevation_loss || 0), 0);

  const stats = [
    { label: "Days", value: String(totalDays || days.length) },
    totalDist > 0 && { label: "Distance", value: `${totalDist} km` },
    totalGain > 0 && { label: "Total Ascent", value: `↑ ${totalGain}m` },
    totalLoss > 0 && { label: "Total Descent", value: `↓ ${totalLoss}m` },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        marginBottom: 40,
        border: "1px solid #ede8e1",
        borderRadius: 14,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            padding: "18px 20px",
            borderRight: i < stats.length - 1 ? "1px solid #ede8e1" : "none",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#c4b49a",
              marginBottom: 4,
            }}
          >
            {s.label}
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 26,
              letterSpacing: "0.04em",
              color: "#1a1208",
              lineHeight: 1,
            }}
          >
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
export function ItineraryTimeline({ days, totalDays }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!days || days.length === 0) return null;

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700&display=swap');
      `}</style>

      <div style={{ background: "#fff", borderRadius: 16, padding: "32px 32px 8px" }}>
        {/* Section header */}
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#c4b49a",
              margin: "0 0 6px",
            }}
          >
            Your Journey
          </p>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 42,
              letterSpacing: "0.04em",
              color: "#1a1208",
              margin: 0,
              lineHeight: 1,
            }}
          >
            Day-by-Day Itinerary
          </h2>
        </div>

        {/* Summary stats */}
        <SummaryBar days={days} totalDays={totalDays} />

        {/* Day rows */}
        <div>
          {days.map((item, index) => (
            <DayRow
              key={item.day}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Bottom padding */}
        <div style={{ height: 24 }} />
      </div>
    </>
  );
}
