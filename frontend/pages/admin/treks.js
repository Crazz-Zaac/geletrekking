"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

// Brand colors
const COLORS = {
  primary: "#e84610",
  gold: "#fed81e",
  greenDark: "#2a3a19",
  navy: "#282c62",
  bgDark: "#0a0f14",
};

export default function AdminTreksPage() {
  const router = useRouter();

  const [treks, setTreks] = useState([]);
  const [selectedTrek, setSelectedTrek] = useState(null);
  const [activeSection, setActiveSection] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ───────────────── AUTH + LOAD TREKS ─────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || (role !== "admin" && role !== "superadmin")) {
      router.push("/etalogin");
      return;
    }

    fetchTreks();
  }, []);

  const fetchTreks = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/treks`);
      setTreks(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const selectTrek = async (id) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/treks/${id}`
      );
      // ensure arrays exist
      setSelectedTrek({
        ...res.data,
        itinerary: res.data.itinerary || [],
        highlights: res.data.highlights || [],
        includes: res.data.includes || [],
        excludes: res.data.excludes || [],
        gallery_images: res.data.gallery_images || [],
        extra_sections: res.data.extra_sections || [],
        offer_includes: res.data.offer_includes || [],
      });
      setActiveSection("basic");
    } catch (err) {
      console.error(err);
    }
  };

  // ───────────────── HELPERS ─────────────────
  const updateField = (field, value) => {
    setSelectedTrek((prev) => ({ ...prev, [field]: value }));
  };

  // Itinerary
  const addItineraryDay = () => {
    const list = selectedTrek.itinerary || [];
    const nextDay = list.length + 1;
    updateField("itinerary", [...list, { day: nextDay, title: "", description: "" }]);
  };

  const updateItinerary = (index, key, value) => {
    const list = [...selectedTrek.itinerary];
    list[index][key] = value;
    updateField("itinerary", list);
  };

  const removeItineraryDay = (index) => {
    let list = [...selectedTrek.itinerary];
    list.splice(index, 1);
    list = list.map((d, i) => ({ ...d, day: i + 1 }));
    updateField("itinerary", list);
  };

  // Extra sections
  const addExtraSection = () => {
    const list = selectedTrek.extra_sections || [];
    updateField("extra_sections", [...list, { title: "", content: "" }]);
  };

  const updateExtraSection = (i, key, value) => {
    const list = [...selectedTrek.extra_sections];
    list[i][key] = value;
    updateField("extra_sections", list);
  };

  const removeExtraSection = (i) => {
    const list = selectedTrek.extra_sections.filter((_, idx) => idx !== i);
    updateField("extra_sections", list);
  };

  // Save + delete
  const saveTrek = async () => {
    if (!selectedTrek) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/treks/${selectedTrek._id}`,
        selectedTrek,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✔ Trek updated");
      fetchTreks();
    } catch (err) {
      console.error(err);
      alert("Error updating trek");
    } finally {
      setSaving(false);
    }
  };

  const deleteTrek = async () => {
    if (!selectedTrek) return;
    const ok = confirm(`Delete "${selectedTrek.name}"?`);
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/treks/${selectedTrek._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("🗑 Trek deleted");
      setSelectedTrek(null);
      fetchTreks();
    } catch (err) {
      console.error(err);
      alert("Error deleting trek");
    }
  };

  if (loading) {
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: "80px" }}>
        Loading treks...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* LEFT: TREK LIST */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Treks</h2>

        <button
          onClick={() => router.push("/admin/create-trek")}
          style={styles.createBtn}
        >
          ➕ Create New Trek
        </button>

        <div style={{ marginTop: "20px" }}>
          {treks.map((trek) => (
            <div
              key={trek._id}
              onClick={() => selectTrek(trek._id)}
              style={{
                ...styles.trekItem,
                background:
                  selectedTrek?._id === trek._id
                    ? COLORS.primary
                    : "rgba(255,255,255,0.06)",
                border:
                  selectedTrek?._id === trek._id
                    ? `2px solid ${COLORS.gold}`
                    : "1px solid #444",
              }}
            >
              {trek.name}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: EDITOR */}
      <div style={styles.rightPanel}>
        {!selectedTrek && (
          <h2 style={styles.noSelection}>
            Select a trek from the left to edit
          </h2>
        )}

        {selectedTrek && (
          <div style={styles.editorWrapper}>
            {/* Vertical section nav */}
            <div style={styles.sectionNav}>
              {[
                ["basic", "Basic Info"],
                ["pricing", "Pricing"],
                ["gallery", "Gallery"],
                ["lists", "Lists"],
                ["itinerary", "Itinerary"],
                ["offers", "Offers"],
                ["extras", "Extra Sections"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  style={
                    activeSection === key
                      ? styles.sectionNavItemActive
                      : styles.sectionNavItem
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Section content */}
            <div style={styles.editorContent}>
              <h2 style={styles.editorTitle}>Edit: {selectedTrek.name}</h2>

              {/* BASIC */}
              {activeSection === "basic" && (
                <div style={styles.card}>
                  <label style={styles.label}>Trek Name</label>
                  <input
                    style={styles.input}
                    value={selectedTrek.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />

                  <label style={styles.label}>Overview</label>
                  <textarea
                    style={styles.textarea}
                    value={selectedTrek.overview}
                    onChange={(e) => updateField("overview", e.target.value)}
                  />

                  <label style={styles.label}>Best Season (optional)</label>
                  <input
                    style={styles.input}
                    value={selectedTrek.best_season || ""}
                    onChange={(e) =>
                      updateField("best_season", e.target.value)
                    }
                  />

                  <label style={styles.label}>Difficulty</label>
                  <select
                    style={styles.input}
                    value={selectedTrek.difficulty || ""}
                    onChange={(e) =>
                      updateField("difficulty", e.target.value)
                    }
                  >
                    <option value="">Select Difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Manual">Manual (Custom)</option>
                  </select>

                  {selectedTrek.difficulty === "Manual" && (
                    <>
                      <label style={styles.label}>Custom Difficulty</label>
                      <input
                        style={styles.input}
                        placeholder="e.g. High Altitude, Challenging"
                        onChange={(e) =>
                          updateField("difficulty", e.target.value)
                        }
                      />
                    </>
                  )}

                  <label style={styles.label}>Duration (Days)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={selectedTrek.duration_days || ""}
                    onChange={(e) =>
                      updateField("duration_days", e.target.value)
                    }
                  />

                  <label style={styles.label}>Max Altitude (m)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={selectedTrek.max_altitude_meters || ""}
                    onChange={(e) =>
                      updateField("max_altitude_meters", e.target.value)
                    }
                  />

                  <label style={styles.label}>Group Size Min</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={selectedTrek.group_size_min || ""}
                    onChange={(e) =>
                      updateField("group_size_min", e.target.value)
                    }
                  />

                  <label style={styles.label}>Group Size Max</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={selectedTrek.group_size_max || ""}
                    onChange={(e) =>
                      updateField("group_size_max", e.target.value)
                    }
                  />
                </div>
              )}

              {/* PRICING */}
              {activeSection === "pricing" && (
                <div style={styles.card}>
                  <label style={styles.label}>Price (USD)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={selectedTrek.price_usd || ""}
                    onChange={(e) =>
                      updateField("price_usd", e.target.value)
                    }
                  />

                  <label style={styles.label}>Price (GBP)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={selectedTrek.price_gbp || ""}
                    onChange={(e) =>
                      updateField("price_gbp", e.target.value)
                    }
                  />
                </div>
              )}

              {/* GALLERY */}
              {activeSection === "gallery" && (
                <div style={styles.card}>
                  <label style={styles.label}>Feature Image URL</label>
                  <input
                    style={styles.input}
                    value={selectedTrek.image_url || ""}
                    onChange={(e) =>
                      updateField("image_url", e.target.value)
                    }
                  />

                  <label style={styles.label}>
                    Gallery Images (comma separated URLs)
                  </label>
                  <input
                    style={styles.input}
                    value={(selectedTrek.gallery_images || []).join(",")}
                    onChange={(e) =>
                      updateField(
                        "gallery_images",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                  />
                </div>
              )}

              {/* LISTS */}
              {activeSection === "lists" && (
                <div style={styles.card}>
                  <label style={styles.label}>Highlights</label>
                  <input
                    style={styles.input}
                    value={(selectedTrek.highlights || []).join(",")}
                    onChange={(e) =>
                      updateField(
                        "highlights",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                  />

                  <label style={styles.label}>Includes</label>
                  <input
                    style={styles.input}
                    value={(selectedTrek.includes || []).join(",")}
                    onChange={(e) =>
                      updateField(
                        "includes",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                  />

                  <label style={styles.label}>Excludes</label>
                  <input
                    style={styles.input}
                    value={(selectedTrek.excludes || []).join(",")}
                    onChange={(e) =>
                      updateField(
                        "excludes",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                  />
                </div>
              )}

              {/* ITINERARY */}
              {activeSection === "itinerary" && (
                <div style={styles.card}>
                  <button
                    onClick={addItineraryDay}
                    style={styles.addBtn}
                  >
                    ➕ Add Day
                  </button>

                  {(selectedTrek.itinerary || []).map((day, index) => (
                    <div key={index} style={styles.itineraryBox}>
                      <h3 style={styles.subTitle}>Day {day.day}</h3>

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
                          updateItinerary(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />

                      <button
                        style={styles.removeBtn}
                        onClick={() => removeItineraryDay(index)}
                      >
                        ❌ Remove Day
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* OFFERS */}
              {activeSection === "offers" && (
                <div style={styles.card}>
                  <label style={styles.label}>
                    <input
                      type="checkbox"
                      checked={selectedTrek.has_offer || false}
                      onChange={(e) =>
                        updateField("has_offer", e.target.checked)
                      }
                    />{" "}
                    Enable Offer
                  </label>

                  {selectedTrek.has_offer && (
                    <>
                      <label style={styles.label}>Offer Title</label>
                      <input
                        style={styles.input}
                        value={selectedTrek.offer_title || ""}
                        onChange={(e) =>
                          updateField("offer_title", e.target.value)
                        }
                      />

                      <label style={styles.label}>Offer Description</label>
                      <textarea
                        style={styles.textarea}
                        value={selectedTrek.offer_description || ""}
                        onChange={(e) =>
                          updateField(
                            "offer_description",
                            e.target.value
                          )
                        }
                      />

                      <label style={styles.label}>
                        Offer Includes (comma separated)
                      </label>
                      <input
                        style={styles.input}
                        value={(selectedTrek.offer_includes || []).join(",")}
                        onChange={(e) =>
                          updateField(
                            "offer_includes",
                            e.target.value.split(",").map((s) => s.trim())
                          )
                        }
                      />

                      <label style={styles.label}>Offer Price From</label>
                      <input
                        type="number"
                        style={styles.input}
                        value={selectedTrek.offer_price_from || ""}
                        onChange={(e) =>
                          updateField(
                            "offer_price_from",
                            e.target.value
                          )
                        }
                      />

                      <label style={styles.label}>Offer Price To</label>
                      <input
                        type="number"
                        style={styles.input}
                        value={selectedTrek.offer_price_to || ""}
                        onChange={(e) =>
                          updateField("offer_price_to", e.target.value)
                        }
                      />

                      <label style={styles.label}>Offer Valid From</label>
                      <input
                        type="date"
                        style={styles.input}
                        value={
                          selectedTrek.offer_valid_from
                            ? selectedTrek.offer_valid_from.substring(0, 10)
                            : ""
                        }
                        onChange={(e) =>
                          updateField("offer_valid_from", e.target.value)
                        }
                      />

                      <label style={styles.label}>Offer Valid To</label>
                      <input
                        type="date"
                        style={styles.input}
                        value={
                          selectedTrek.offer_valid_to
                            ? selectedTrek.offer_valid_to.substring(0, 10)
                            : ""
                        }
                        onChange={(e) =>
                          updateField("offer_valid_to", e.target.value)
                        }
                      />
                    </>
                  )}
                </div>
              )}

              {/* EXTRA SECTIONS */}
              {activeSection === "extras" && (
                <div style={styles.card}>
                  <button onClick={addExtraSection} style={styles.addBtn}>
                    ➕ Add Extra Section
                  </button>

                  {(selectedTrek.extra_sections || []).map((sec, i) => (
                    <div key={i} style={styles.itineraryBox}>
                      <button
                        style={styles.removeBtn}
                        onClick={() => removeExtraSection(i)}
                      >
                        ❌ Remove
                      </button>

                      <label style={styles.label}>Section Title</label>
                      <input
                        style={styles.input}
                        value={sec.title}
                        onChange={(e) =>
                          updateExtraSection(i, "title", e.target.value)
                        }
                      />

                      <label style={styles.label}>Content</label>
                      <textarea
                        style={styles.textarea}
                        value={sec.content}
                        onChange={(e) =>
                          updateExtraSection(i, "content", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* SAVE / DELETE BUTTONS */}
              <div style={{ marginTop: "20px" }}>
                <button
                  onClick={saveTrek}
                  style={styles.saveBtn}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "✔ Save Changes"}
                </button>

                <button onClick={deleteTrek} style={styles.deleteBtn}>
                  🗑 Delete Trek
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────── STYLES ───────────────── */
const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: `linear-gradient(135deg, ${COLORS.bgDark}, ${COLORS.greenDark}, ${COLORS.navy})`,
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },

  /* Left sidebar */
  sidebar: {
    width: "28%",
    background: "rgba(0,0,0,0.6)",
    padding: "24px",
    borderRight: `2px solid ${COLORS.gold}`,
    overflowY: "auto",
  },
  sidebarTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    color: COLORS.gold,
    marginBottom: "16px",
  },
  createBtn: {
    width: "100%",
    padding: "12px",
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.gold})`,
    color: "#000",
    borderRadius: "8px",
    border: `1px solid ${COLORS.gold}`,
    fontWeight: "bold",
    cursor: "pointer",
  },
  trekItem: {
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "10px",
    cursor: "pointer",
    transition: "0.2s",
  },

  /* Right panel */
  rightPanel: {
    width: "72%",
    padding: "24px",
    overflowY: "auto",
  },
  noSelection: {
    textAlign: "center",
    marginTop: "80px",
    color: COLORS.gold,
    fontSize: "20px",
  },

  editorWrapper: {
    display: "flex",
    gap: "20px",
  },

  sectionNav: {
    width: "190px",
    padding: "16px",
    background: "rgba(0,0,0,0.55)",
    borderRadius: "10px",
    border: `1px solid ${COLORS.gold}`,
    height: "fit-content",
  },

  sectionNavItem: {
    width: "100%",
    textAlign: "left",
    padding: "8px 10px",
    marginBottom: "6px",
    borderRadius: "6px",
    border: "1px solid #444",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },

  sectionNavItemActive: {
    width: "100%",
    textAlign: "left",
    padding: "8px 10px",
    marginBottom: "6px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.gold}`,
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.gold})`,
    color: "#000",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },

  editorContent: {
    flex: 1,
  },

  editorTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: COLORS.gold,
    marginBottom: "18px",
  },

  card: {
    background: "rgba(20,20,20,0.7)",
    borderRadius: "12px",
    border: `1px solid ${COLORS.gold}`,
    padding: "18px",
    boxShadow: `0 0 15px ${COLORS.greenDark}55`,
  },

  label: {
    display: "block",
    marginTop: "10px",
    marginBottom: "4px",
    fontWeight: "bold",
    color: COLORS.gold,
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.gold}`,
    background: "#111",
    color: "#fff",
    marginBottom: "10px",
    fontSize: "14px",
  },

  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.gold}`,
    background: "#111",
    color: "#fff",
    marginBottom: "10px",
    minHeight: "90px",
    fontSize: "14px",
  },

  addBtn: {
    padding: "8px 14px",
    background: COLORS.primary,
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: "12px",
  },

  itineraryBox: {
    border: `1px solid ${COLORS.gold}`,
    borderRadius: "8px",
    padding: "12px",
    background: "rgba(30,30,30,0.75)",
    marginBottom: "10px",
  },

  subTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: COLORS.gold,
    marginBottom: "6px",
  },

  removeBtn: {
    padding: "6px 10px",
    background: COLORS.primary,
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "6px",
    fontSize: "13px",
  },

  saveBtn: {
    padding: "12px 18px",
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.gold})`,
    color: "#000",
    borderRadius: "10px",
    border: `1px solid ${COLORS.gold}`,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    marginRight: "10px",
  },

  deleteBtn: {
    padding: "12px 18px",
    background: "#8b0000",
    color: "#fff",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },
};
