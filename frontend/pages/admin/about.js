"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const COLORS = {
  primary: "#e84610",
  gold: "#fed81e",
  greenDark: "#2a3a19",
  navy: "#282c62",
  bgDark: "#0a0f14",
};

export default function AdminAboutPageEditor() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [about, setAbout] = useState({
    heroTitle: "",
    heroSubtitle: "",
    heroImageUrl: "",
    missionTitle: "",
    missionBody: "",
    storyTitle: "",
    storyBody: "",
    highlights: [],
    stats: [],
  });

  // AUTH CHECK
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || (role !== "admin" && role !== "superadmin")) {
      router.replace("/etalogin");
      return;
    }

    setAuthChecked(true);
    fetchAbout(token);
  }, []);

  async function fetchAbout(token) {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/about`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = res.data || {};
      setAbout({
        heroTitle: data.heroTitle || "",
        heroSubtitle: data.heroSubtitle || "",
        heroImageUrl: data.heroImageUrl || "",
        missionTitle: data.missionTitle || "",
        missionBody: data.missionBody || "",
        storyTitle: data.storyTitle || "",
        storyBody: data.storyBody || "",
        highlights: data.highlights || [],
        stats: data.stats || [],
      });
    } catch (err) {
      console.error("Error loading About page in admin:", err);
    }
  }

  if (!authChecked) return null;

  const handleChange = (field, value) => {
    setAbout((prev) => ({ ...prev, [field]: value }));
  };

  const handleHighlightChange = (index, field, value) => {
    const copy = [...about.highlights];
    copy[index] = { ...copy[index], [field]: value };
    setAbout((prev) => ({ ...prev, highlights: copy }));
  };

  const addHighlight = () => {
    setAbout((prev) => ({
      ...prev,
      highlights: [...(prev.highlights || []), { title: "", description: "" }],
    }));
  };

  const removeHighlight = (index) => {
    const copy = [...about.highlights];
    copy.splice(index, 1);
    setAbout((prev) => ({ ...prev, highlights: copy }));
  };

  const handleStatChange = (index, field, value) => {
    const copy = [...about.stats];
    copy[index] = { ...copy[index], [field]: value };
    setAbout((prev) => ({ ...prev, stats: copy }));
  };

  const addStat = () => {
    setAbout((prev) => ({
      ...prev,
      stats: [...(prev.stats || []), { label: "", value: "" }],
    }));
  };

  const removeStat = (index) => {
    const copy = [...about.stats];
    copy.splice(index, 1);
    setAbout((prev) => ({ ...prev, stats: copy }));
  };

  const handleSave = async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/etalogin");
      return;
    }

    setSaving(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/about`,
        about,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("About page updated successfully ✅");
    } catch (err) {
      console.error("Failed to save About page:", err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const sectionStyle = {
    marginBottom: "2rem",
    padding: "1.5rem",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.9rem",
    marginBottom: "0.25rem",
    color: "#c0c0c0",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.6rem 0.8rem",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(0,0,0,0.4)",
    color: "white",
    fontSize: "0.95rem",
    outline: "none",
    marginBottom: "0.6rem",
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: "90px",
    resize: "vertical",
  };

  const buttonStyle = {
    padding: "0.7rem 1.4rem",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    background: COLORS.primary,
    color: "white",
    fontWeight: 600,
    marginRight: "0.5rem",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bgDark,
        color: "white",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: COLORS.gold,
          }}
        >
          Admin: Edit About Us Page
        </h1>

        {/* HERO */}
        <section style={sectionStyle}>
          <h2 style={{ marginBottom: "1rem" }}>Hero Section</h2>

          <label style={labelStyle}>Hero Title</label>
          <input
            style={inputStyle}
            value={about.heroTitle}
            onChange={(e) => handleChange("heroTitle", e.target.value)}
          />

          <label style={labelStyle}>Hero Subtitle</label>
          <textarea
            style={textareaStyle}
            value={about.heroSubtitle}
            onChange={(e) => handleChange("heroSubtitle", e.target.value)}
          />

          <label style={labelStyle}>Hero Image URL</label>
          <input
            style={inputStyle}
            value={about.heroImageUrl}
            onChange={(e) => handleChange("heroImageUrl", e.target.value)}
            placeholder="https://..."
          />
        </section>

        {/* MISSION */}
        <section style={sectionStyle}>
          <h2 style={{ marginBottom: "1rem" }}>Mission</h2>
          <label style={labelStyle}>Mission Title</label>
          <input
            style={inputStyle}
            value={about.missionTitle}
            onChange={(e) => handleChange("missionTitle", e.target.value)}
          />

          <label style={labelStyle}>Mission Body</label>
          <textarea
            style={textareaStyle}
            value={about.missionBody}
            onChange={(e) => handleChange("missionBody", e.target.value)}
          />
        </section>

        {/* STORY */}
        <section style={sectionStyle}>
          <h2 style={{ marginBottom: "1rem" }}>Our Story</h2>
          <label style={labelStyle}>Story Title</label>
          <input
            style={inputStyle}
            value={about.storyTitle}
            onChange={(e) => handleChange("storyTitle", e.target.value)}
          />

          <label style={labelStyle}>Story Body</label>
          <textarea
            style={textareaStyle}
            value={about.storyBody}
            onChange={(e) => handleChange("storyBody", e.target.value)}
          />
        </section>

        {/* HIGHLIGHTS */}
        <section style={sectionStyle}>
          <h2 style={{ marginBottom: "1rem" }}>Highlights</h2>

          {(about.highlights || []).map((item, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "1rem",
                padding: "0.8rem",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <label style={labelStyle}>Title</label>
              <input
                style={inputStyle}
                value={item.title}
                onChange={(e) =>
                  handleHighlightChange(idx, "title", e.target.value)
                }
              />
              <label style={labelStyle}>Description</label>
              <textarea
                style={textareaStyle}
                value={item.description}
                onChange={(e) =>
                  handleHighlightChange(idx, "description", e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => removeHighlight(idx)}
                style={{
                  ...buttonStyle,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ff7474",
                }}
              >
                Remove
              </button>
            </div>
          ))}

          <button type="button" style={buttonStyle} onClick={addHighlight}>
            + Add Highlight
          </button>
        </section>

        {/* STATS */}
        <section style={sectionStyle}>
          <h2 style={{ marginBottom: "1rem" }}>Stats</h2>
          {(about.stats || []).map((s, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "1rem",
                padding: "0.8rem",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <label style={labelStyle}>Label</label>
              <input
                style={inputStyle}
                value={s.label}
                onChange={(e) =>
                  handleStatChange(idx, "label", e.target.value)
                }
              />

              <label style={labelStyle}>Value</label>
              <input
                style={inputStyle}
                value={s.value}
                onChange={(e) =>
                  handleStatChange(idx, "value", e.target.value)
                }
              />

              <button
                type="button"
                onClick={() => removeStat(idx)}
                style={{
                  ...buttonStyle,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ff7474",
                }}
              >
                Remove
              </button>
            </div>
          ))}

          <button type="button" style={buttonStyle} onClick={addStat}>
            + Add Stat
          </button>
        </section>

        {/* SAVE BUTTON */}
        <div style={{ marginBottom: "3rem" }}>
          <button
            type="button"
            onClick={handleSave}
            style={buttonStyle}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
