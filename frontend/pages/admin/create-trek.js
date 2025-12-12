"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

// BRAND COLORS
const COLORS = {
  primary: "#e84610",
  gold: "#fed81e",
  greenDark: "#2a3a19",
  navy: "#282c62",
  bgDark: "#0a0f14",
};

export default function CreateTrek() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ================================
  // FORM DATA
  // ================================
  const [formData, setFormData] = useState({
    name: "",
    overview: "",

    // images
    image_url: "",
    gallery_images: [],

    // lists
    highlights: [],
    includes: [],
    excludes: [],

    // itinerary
    itinerary: [],

    // trek info
    best_season: "",
    duration_days: "",
    difficulty: "",
    group_size_min: "",
    group_size_max: "",
    max_altitude_meters: "",

    // pricing
    price_usd: "",
    price_gbp: "",

    // offers
    has_offer: false,
    offer_title: "",
    offer_description: "",
    offer_price_from: "",
    offer_price_to: "",
    offer_includes: [],
    offer_valid_from: "",
    offer_valid_to: "",

    // extra sections
    extra_sections: [],
  });

  // ----------------------
  // AUTH CHECK
  // ----------------------
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

  // ----------------------
  // HELPERS
  // ----------------------
  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // ----------------------
  // ITINERARY LOGIC
  // ----------------------
  const addItineraryDay = () => {
    const day = formData.itinerary.length + 1;
    updateField("itinerary", [
      ...formData.itinerary,
      { day, title: "", description: "" },
    ]);
  };

  const updateItinerary = (index, field, value) => {
    const updated = [...formData.itinerary];
    updated[index][field] = value;
    updateField("itinerary", updated);
  };

  const removeItineraryDay = (index) => {
    let updated = [...formData.itinerary];
    updated.splice(index, 1);

    // renumber days
    updated = updated.map((d, i) => ({ ...d, day: i + 1 }));

    updateField("itinerary", updated);
  };

  // ----------------------
  // EXTRA SECTIONS
  // ----------------------
  const addExtraSection = () => {
    updateField("extra_sections", [
      ...formData.extra_sections,
      { title: "", content: "" },
    ]);
  };

  const updateExtraSection = (index, field, value) => {
    const updated = [...formData.extra_sections];
    updated[index][field] = value;
    updateField("extra_sections", updated);
  };

  const removeExtraSection = (index) => {
    const updated = [...formData.extra_sections];
    updated.splice(index, 1);
    updateField("extra_sections", updated);
  };

  // ----------------------
  // SUBMIT
  // ----------------------
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/treks`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("🎉 Trek created successfully!");
      router.push("/admin/treks");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error creating trek.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🧭 Create Trek Package</h1>

      {message && <p style={styles.error}>{message}</p>}

      {/* TABS */}
      <div style={styles.tabRow}>
        {[
          { id: "basic", label: "Basic Info" },
          { id: "pricing", label: "Pricing" },
          { id: "gallery", label: "Gallery" },
          { id: "details", label: "Lists" },
          { id: "itinerary", label: "Itinerary" },
          { id: "offers", label: "Offers" },
          { id: "extras", label: "Extra Sections" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={activeTab === tab.id ? styles.tabActive : styles.tabBtn}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ───────────────────────────────── BASIC INFO ───────────────────────────────── */}
      {activeTab === "basic" && (
        <div style={styles.card}>
          <label style={styles.label}>Trek Name</label>
          <input
            style={styles.input}
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <label style={styles.label}>Overview</label>
          <textarea
            style={styles.textarea}
            value={formData.overview}
            onChange={(e) => updateField("overview", e.target.value)}
          />

          <label style={styles.label}>Best Season</label>
          <input
            style={styles.input}
            value={formData.best_season}
            onChange={(e) => updateField("best_season", e.target.value)}
                    />
          <label style={styles.label}>Difficulty</label>
          <select
            style={styles.input}
            value={formData.difficulty}
            onChange={(e) => updateField("difficulty", e.target.value)}
          >
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          

          <label style={styles.label}>Duration Days</label>
          <input
            type="number"
            style={styles.input}
            value={formData.duration_days}
            onChange={(e) => updateField("duration_days", e.target.value)}
          />

          <label style={styles.label}>Max Altitude (m)</label>
          <input
            type="number"
            style={styles.input}
            value={formData.max_altitude_meters}
            onChange={(e) =>
              updateField("max_altitude_meters", e.target.value)
            }
          />

          <label style={styles.label}>Group Size Min</label>
          <input
            type="number"
            style={styles.input}
            value={formData.group_size_min}
            onChange={(e) => updateField("group_size_min", e.target.value)}
          />

          <label style={styles.label}>Group Size Max</label>
          <input
            type="number"
            style={styles.input}
            value={formData.group_size_max}
            onChange={(e) => updateField("group_size_max", e.target.value)}
          />
        </div>
      )}

      {/* ───────────────────────────────── PRICING ───────────────────────────────── */}
      {activeTab === "pricing" && (
        <div style={styles.card}>
          <label style={styles.label}>Price USD</label>
          <input
            type="number"
            style={styles.input}
            value={formData.price_usd}
            onChange={(e) => updateField("price_usd", e.target.value)}
          />

          <label style={styles.label}>Price GBP</label>
          <input
            type="number"
            style={styles.input}
            value={formData.price_gbp}
            onChange={(e) => updateField("price_gbp", e.target.value)}
          />
        </div>
      )}

      {/* ───────────────────────────────── GALLERY ───────────────────────────────── */}
      {activeTab === "gallery" && (
        <div style={styles.card}>
          <label style={styles.label}>Feature Image URL</label>
          <input
            style={styles.input}
            value={formData.image_url}
            onChange={(e) => updateField("image_url", e.target.value)}
          />

          <label style={styles.label}>Gallery Images </label>
          <input
            style={styles.input}
            value={formData.gallery_images.join(",")}
            onChange={(e) =>
              updateField("gallery_images", e.target.value.split(","))
            }
          />
        </div>
      )}

      {/* ───────────────────────────────── LISTS ───────────────────────────────── */}
      {activeTab === "details" && (
        <div style={styles.card}>
          <label style={styles.label}>Highlights</label>
          <input
            style={styles.input}
            value={formData.highlights.join(",")}
            onChange={(e) =>
              updateField("highlights", e.target.value.split(","))
            }
          />

          <label style={styles.label}>Includes </label>
          <input
            style={styles.input}
            value={formData.includes.join(",")}
            onChange={(e) => updateField("includes", e.target.value.split(","))}
          />

          <label style={styles.label}>Excludes </label>
          <input
            style={styles.input}
            value={formData.excludes.join(",")}
            onChange={(e) => updateField("excludes", e.target.value.split(","))}
          />
        </div>
      )}

      {/* ───────────────────────────────── ITINERARY ───────────────────────────────── */}
      {activeTab === "itinerary" && (
        <div style={styles.card}>
          <button onClick={addItineraryDay} style={styles.addBtn}>
            ➕ Add Day
          </button>

          {formData.itinerary.map((day, index) => (
            <div key={index} style={styles.itineraryBox}>
              <h3 style={styles.itineraryTitle}>Day {day.day}</h3>

              <label style={styles.label}>Title</label>
              <input
                style={styles.input}
                value={day.title}
                onChange={(e) =>
                  updateItinerary(index, "title", e.target.value)
                }
              />

              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={day.description}
                onChange={(e) =>
                  updateItinerary(index, "description", e.target.value)
                }
              />

              <button
                style={styles.deleteBtn}
                onClick={() => removeItineraryDay(index)}
              >
                ❌ Remove Day
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ───────────────────────────────── OFFERS ───────────────────────────────── */}
      {activeTab === "offers" && (
        <div style={styles.card}>
          <label style={styles.label}>
            <input
              type="checkbox"
              checked={formData.has_offer}
              onChange={(e) => updateField("has_offer", e.target.checked)}
            />{" "}
            Enable Offer
          </label>

          {formData.has_offer && (
            <>
              <label style={styles.label}>Offer Title</label>
              <input
                style={styles.input}
                value={formData.offer_title}
                onChange={(e) => updateField("offer_title", e.target.value)}
              />

              <label style={styles.label}>Offer Description</label>
              <textarea
                style={styles.textarea}
                value={formData.offer_description}
                onChange={(e) =>
                  updateField("offer_description", e.target.value)
                }
              />

              <label style={styles.label}>Offer Includes (comma separated)</label>
              <input
                style={styles.input}
                value={formData.offer_includes.join(",")}
                onChange={(e) =>
                  updateField("offer_includes", e.target.value.split(","))
                }
              />

              <label style={styles.label}>Offer Price From</label>
              <input
                type="number"
                style={styles.input}
                value={formData.offer_price_from}
                onChange={(e) =>
                  updateField("offer_price_from", e.target.value)
                }
              />

              <label style={styles.label}>Offer Price To</label>
              <input
                type="number"
                style={styles.input}
                value={formData.offer_price_to}
                onChange={(e) =>
                  updateField("offer_price_to", e.target.value)
                }
              />

              <label style={styles.label}>Offer Valid From</label>
              <input
                type="date"
                style={styles.input}
                value={formData.offer_valid_from}
                onChange={(e) =>
                  updateField("offer_valid_from", e.target.value)
                }
              />

              <label style={styles.label}>Offer Valid To</label>
              <input
                type="date"
                style={styles.input}
                value={formData.offer_valid_to}
                onChange={(e) =>
                  updateField("offer_valid_to", e.target.value)
                }
              />
            </>
          )}
        </div>
      )}

      {/* ───────────────────────────────── EXTRA SECTIONS ───────────────────────────────── */}
      {activeTab === "extras" && (
        <div style={styles.card}>
          <button onClick={addExtraSection} style={styles.addBtn}>
            ➕ Add Extra Section
          </button>

          {formData.extra_sections.map((section, index) => (
            <div key={index} style={styles.itineraryBox}>
              <label style={styles.label}>Section Title</label>
              <input
                style={styles.input}
                value={section.title}
                onChange={(e) =>
                  updateExtraSection(index, "title", e.target.value)
                }
              />

              <label style={styles.label}>Content</label>
              <textarea
                style={styles.textarea}
                value={section.content}
                onChange={(e) =>
                  updateExtraSection(index, "content", e.target.value)
                }
              />

              <button
                style={styles.deleteBtn}
                onClick={() => removeExtraSection(index)}
              >
                ❌ Remove Section
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ───────────────────────────────── SUBMIT ───────────────────────────────── */}
      <button style={styles.submitBtn} onClick={handleSubmit}>
        ✔ Create Trek
      </button>
    </div>
  );
}

/* ======================================================================
   STYLES
   ====================================================================== */
const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    background: `linear-gradient(135deg, ${COLORS.bgDark}, ${COLORS.greenDark}, ${COLORS.navy})`,
    color: "#fff",
    fontFamily: "sans-serif",
  },

  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: COLORS.gold,
    marginBottom: "20px",
  },

  tabRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  tabBtn: {
    padding: "10px 18px",
    background: COLORS.navy,
    color: "#fff",
    border: `1px solid ${COLORS.gold}`,
    borderRadius: "8px",
    cursor: "pointer",
  },

  tabActive: {
    padding: "10px 18px",
    background: `linear-gradient(135deg, ${COLORS.e84610}, ${COLORS.gold})`,
    color: "#000",
    border: `1px solid ${COLORS.gold}`,
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  card: {
    background: "rgba(20,20,20,0.65)",
    border: `1px solid ${COLORS.gold}`,
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: `0 0 15px ${COLORS.greenDark}55`,
  },

  label: {
    color: COLORS.gold,
    fontWeight: "bold",
    marginTop: "10px",
    marginBottom: "5px",
    display: "block",
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.gold}`,
    background: "#111",
    color: "#fff",
    marginBottom: "12px",
  },

  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.gold}`,
    background: "#111",
    color: "#fff",
    height: "90px",
    marginBottom: "12px",
  },

  addBtn: {
    padding: "10px 16px",
    background: COLORS.primary,
    color: "#fff",
    borderRadius: "8px",
    marginBottom: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },

  deleteBtn: {
    background: COLORS.primary,
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
  },

  itineraryBox: {
    border: `1px solid ${COLORS.gold}`,
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "8px",
    background: "rgba(30,30,30,0.65)",
  },

  itineraryTitle: {
    color: COLORS.gold,
    fontWeight: "bold",
    marginBottom: "10px",
  },

  submitBtn: {
    marginTop: "20px",
    padding: "14px 20px",
    fontSize: "18px",
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.gold})`,
    color: "#000",
    borderRadius: "10px",
    border: `1px solid ${COLORS.gold}`,
    cursor: "pointer",
    fontWeight: "bold",
  },

  error: {
    color: COLORS.primary,
    marginBottom: "10px",
  },
};
