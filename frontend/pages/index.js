"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

export default function HomePage() {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load featured treks
  useEffect(() => {
    const loadTreks = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/treks`
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

  return (
    <div style={pageContainer}>
      {/* HERO SECTION */}
      <section style={heroSection}>
        <div>
          <h1 style={heroTitle}>Explore the Best Trekking Adventures</h1>
          <p style={heroSubtitle}>
            Discover breathtaking destinations, unique cultures, and unforgettable experiences with GeleTrekking.
          </p>
          <Link href="/trek" style={heroButton}>
            View All Treks
          </Link>
        </div>

        <img
          src="https://images.unsplash.com/photo-1509644851193-85309e4bba2b"
          alt="Trekking Hero"
          style={heroImg}
        />
      </section>

      {/* FEATURED TREKS */}
      <section style={sectionWrapper}>
        <h2 style={sectionTitle}>Featured Trek Packages</h2>

        {loading ? (
          <p style={{ color: "#aaa", marginTop: "1rem" }}>Loading trek packages...</p>
        ) : treks.length === 0 ? (
          <p style={{ color: "#aaa", marginTop: "1rem" }}>No trek packages available.</p>
        ) : (
          <div style={trekGrid}>
            {treks.slice(0, 6).map((trek) => (
              <Link href={`/trek/${trek._id}`} key={trek._id} style={trekCard}>
                <img
                  src={
                    trek.featuredImage ||
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
                  }
                  alt={trek.name}
                  style={trekImg}
                />

                <div style={trekInfo}>
                  <h3 style={trekTitle}>{trek.name}</h3>
                  <p style={trekPrice}>
                    {trek.offer?.isActive
                      ? `Rs. ${trek.offer.discountedPrice} (Offer)`
                      : `Rs. ${trek.price}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/trek" style={viewMoreBtn}>
            View All Trek Packages
          </Link>
        </div>
      </section>
    </div>
  );
}

/////////////////////////////
// STYLING (INLINE OBJECTS)
/////////////////////////////

const pageContainer = {
  minHeight: "100vh",
  background: "#0a0f14",
  padding: "2rem 1.5rem",
  color: "white",
};

// HERO
const heroSection = {
  display: "grid",
  gridTemplateColumns: "1.3fr 1fr",
  alignItems: "center",
  gap: "2rem",
  marginBottom: "4rem",
};

const heroTitle = {
  fontSize: "2.6rem",
  fontWeight: 700,
  marginBottom: "1rem",
};

const heroSubtitle = {
  fontSize: "1.1rem",
  lineHeight: 1.7,
  color: "#d0d0d0",
  maxWidth: "90%",
  marginBottom: "1.5rem",
};

const heroButton = {
  padding: "0.7rem 1.6rem",
  background: "#e84610",
  color: "white",
  borderRadius: "8px",
  fontWeight: 600,
  textDecoration: "none",
};

const heroImg = {
  width: "100%",
  borderRadius: "15px",
  objectFit: "cover",
  height: "280px",
};

// FEATURED TREKS
const sectionWrapper = {
  marginTop: "2rem",
};

const sectionTitle = {
  fontSize: "1.8rem",
  fontWeight: 600,
  marginBottom: "1.5rem",
};

const trekGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "1.5rem",
};

const trekCard = {
  display: "block",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  overflow: "hidden",
  textDecoration: "none",
  color: "white",
  transition: "0.3s",
};

const trekImg = {
  width: "100%",
  height: "150px",
  objectFit: "cover",
};

const trekInfo = {
  padding: "1rem",
};

const trekTitle = {
  fontSize: "1.1rem",
  fontWeight: 600,
  marginBottom: "0.5rem",
};

const trekPrice = {
  color: "#fed81e",
  fontWeight: 600,
};

const viewMoreBtn = {
  padding: "0.7rem 1.6rem",
  background: "#fed81e",
  color: "#0a0f14",
  fontWeight: 700,
  borderRadius: "8px",
  textDecoration: "none",
};
