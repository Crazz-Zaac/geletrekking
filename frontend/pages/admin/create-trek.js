"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function CreateTrek() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    overview: "",
    price_usd: "",
  });
  const [message, setMessage] = useState("");

  // ✅ Check admin or redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || (role !== "admin" && role !== "superadmin")) {
      router.replace("/etalogin");
      return;
    }
    setLoading(false);
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/treks`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Trek created successfully");
      router.push("/admin/treks");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error creating trek");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "25px" }}>
      <h2 style={{ marginBottom: "15px" }}>🧭 Create Trek Package</h2>

      {message && <p style={{ color: "red" }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>Trek Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          style={inputStyle}
          required
        />

        <label>Overview</label>
        <textarea
          name="overview"
          value={formData.overview}
          onChange={handleChange}
          rows="4"
          style={inputStyle}
          required
        />

        <label>Price (USD)</label>
        <input
          type="number"
          name="price_usd"
          value={formData.price_usd}
          onChange={handleChange}
          style={inputStyle}
          required
        />

        <button type="submit" style={buttonPrimary}>
          ✅ Create Trek
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/treks")}
          style={buttonSecondary}
        >
          ← Back
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #aaa",
};

const buttonPrimary = {
  background: "#0a472e",
  color: "white",
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "10px",
};

const buttonSecondary = {
  background: "#444",
  color: "white",
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "10px",
};
