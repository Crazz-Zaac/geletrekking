"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const COLORS = {
  primary: "#e84610",
  gold: "#fed81e",
  greenDark: "#2a3a19",
  navy: "#282c62",
  bgDark: "#0a0f14",
};

export default function AboutPage() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAbout() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/about`
        );
        setAbout(res.data);
      } catch (err) {
        console.error("Error loading About page:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bgDark,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading About Us...
      </div>
    );
  }

  if (!about) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bgDark,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        About page is coming soon.
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bgDark,
        color: "white",
        padding: "3rem 1.5rem",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* HERO SECTION */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.5fr",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                marginBottom: "1rem",
                color: COLORS.gold,
              }}
            >
              {about.heroTitle}
            </h1>
            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "#d0d0d0",
                maxWidth: "90%",
              }}
            >
              {about.heroSubtitle}
            </p>
          </div>

          {about.heroImageUrl ? (
            <div
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                border: `1px solid rgba(255,255,255,0.1)`,
              }}
            >
              <img
                src={about.heroImageUrl}
                alt="GeleTrekking team"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : null}
        </section>

        {/* STATS */}
        {Array.isArray(about.stats) && about.stats.length > 0 && (
          <section
            style={{
              marginTop: "3rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {about.stats.map((stat, idx) => (
              <div
                key={idx}
                style={{
                  padding: "1.5rem",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.02)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: COLORS.gold,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#b0b0b0" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* MISSION + STORY */}
        <section
          style={{
            marginTop: "3rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: COLORS.gold,
              }}
            >
              {about.missionTitle}
            </h2>
            <p style={{ color: "#d0d0d0", lineHeight: 1.7 }}>
              {about.missionBody}
            </p>
          </div>
          <div>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: COLORS.gold,
              }}
            >
              {about.storyTitle}
            </h2>
            <p style={{ color: "#d0d0d0", lineHeight: 1.7 }}>
              {about.storyBody}
            </p>
          </div>
        </section>

        {/* HIGHLIGHTS */}
        {Array.isArray(about.highlights) && about.highlights.length > 0 && (
          <section style={{ marginTop: "3rem" }}>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                color: COLORS.gold,
                marginBottom: "1rem",
              }}
            >
              Why Trek with GeleTrekking?
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {about.highlights.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "1.5rem",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ color: "#c0c0c0", fontSize: "0.95rem" }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
