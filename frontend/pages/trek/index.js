"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

export default function TrekPackagesPage() {
  const [trekPackages, setTrekPackages] = useState([]);

  useEffect(() => {
    const fetchTreks = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/treks`
        );
        setTrekPackages(response.data);
      } catch (error) {
        console.error("Error fetching trek packages:", error);
      }
    };

    fetchTreks();
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif", background: "#f4f9f6" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#0a472e", fontSize: "32px" }}>
        Trekking Packages
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "25px",
        }}
      >
        {trekPackages.map((trek) => (
          <div
            key={trek._id}
            style={{
              background: "#fff",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "0.3s ease",
            }}
          >
            {/* Image */}
            <img
              src={trek.image_url || "/fallback.jpg"}
              alt={trek.name}
              style={{ width: "100%", height: "220px", objectFit: "cover" }}
            />

            {/* Content */}
            <div style={{ padding: "15px" }}>
              <h2 style={{ marginBottom: "10px", color: "#0a472e" }}>
                {trek.name}
              </h2>

              <p style={{ color: "#444", fontSize: "14px", lineHeight: "1.6" }}>
                {trek.overview?.substring(0, 120) || "No description available"}...
              </p>

              {/* Price */}
              {trek.price_usd && (
                <p style={{ fontSize: "16px", fontWeight: "bold", color: "#0a472e", marginTop: "10px" }}>
                  ${trek.price_usd} USD
                </p>
              )}

              {/* Button */}
              <Link href={`/trek/${trek._id}`}>
                <button
                  style={{
                    marginTop: "15px",
                    width: "100%",
                    padding: "12px",
                    background: "#0a472e",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "0.2s",
                  }}
                >
                  Start Journey →
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
