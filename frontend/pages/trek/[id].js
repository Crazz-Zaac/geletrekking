"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getTrekPackageById } from "../../src/api/trekPackageApi";

export default function TrekPackageDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [trek, setTrek] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTrek = async () => {
      try {
        const data = await getTrekPackageById(id);
        setTrek(data?.trek || data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrek();
  }, [id]);

  if (loading) return <p style={{ padding: "40px", textAlign: "center" }}>Loading...</p>;
  if (!trek) return <p style={{ padding: "40px", textAlign: "center", color: "red" }}>Not found</p>;

  return (
    <div style={{ fontFamily: "Arial", background: "#f7f7f7" }}>
      
      {/* Banner */}
      <div
        style={{
          background: `url(${trek.image || "/fallback.jpg"}) center/cover no-repeat`,
          height: "350px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "34px",
            fontWeight: "bold",
            textShadow: "0px 2px 5px rgba(0,0,0,0.7)",
          }}
        >
          {trek.title || trek.name}
        </div>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "40px auto",
          display: "flex",
          gap: "25px",
          padding: "0 20px",
        }}
      >
        {/* Left Content */}
        <div style={{ flex: 2 }}>
          
          {/* Quick Info */}
          <div
            style={{
              background: "#fff",
              padding: "20px 25px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #e6e6e6",
            }}
          >
            <h2 style={{ marginBottom: "15px" }}>Trip Details</h2>
            <ul style={{ lineHeight: "28px", fontSize: "15px" }}>
              {trek.duration_days && <li><b>Duration:</b> {trek.duration_days} days</li>}
              {trek.difficulty && <li><b>Difficulty:</b> {trek.difficulty}</li>}
              {trek.price_usd && <li><b>Price:</b> ${trek.price_usd}</li>}
              {trek.price_gbp && <li><b>Price (GBP):</b> £{trek.price_gbp}</li>}
              {trek.max_altitude_meters && <li><b>Max Altitude:</b> {trek.max_altitude_meters}m</li>}
            </ul>
          </div>

          {/* Overview */}
          <div
            style={{
              background: "#fff",
              padding: "20px 25px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #e6e6e6",
            }}
          >
            <h3 style={{ marginBottom: "12px" }}>Overview</h3>
            <p style={{ lineHeight: "1.8", color: "#444" }}>
              {trek.overview || trek.description || "No description available."}
            </p>
          </div>

          {/* Highlights */}
          {Array.isArray(trek.highlights) && trek.highlights.length > 0 && (
            <div
              style={{
                background: "#fff",
                padding: "20px 25px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #e6e6e6",
              }}
            >
              <h3 style={{ marginBottom: "12px" }}>Highlights</h3>
              <ul style={{ paddingLeft: "18px", color: "#444", lineHeight: "1.8" }}>
                {trek.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ✅ Additional Sections */}
          {Array.isArray(trek.extra_sections) && trek.extra_sections.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ marginBottom: "12px" }}>Additional Information</h3>
              {trek.extra_sections.map((sec, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "15px",
                  }}
                >
                  <h4 style={{ marginBottom: "8px", color: "#0a472e", fontSize: "18px" }}>
                    {sec.title}
                  </h4>
                  <p style={{ lineHeight: "1.7", color: "#444" }}>
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            padding: "20px 25px",
            borderRadius: "8px",
            border: "1px solid #e6e6e6",
            height: "fit-content",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>Trip Price</h3>
          <p
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "#0a472e",
            }}
          >
            ${trek.price_usd || "N/A"}
          </p>

          <button
            onClick={() => router.back()}
            style={{
              width: "100%",
              padding: "12px",
              background: "#0a472e",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              marginTop: "10px",
            }}
          >
            ← Back to Treks
          </button>
        </div>
      </div>
    </div>
  );
}
