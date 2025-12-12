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

export default function AdminDashboard() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- AUTH CHECK ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      router.replace("/etalogin");
      return;
    }

    setAuthChecked(true);
    fetchTreks();
  }, []);

  if (!authChecked) return null;

  /* ---------------- FETCH TREKS ---------------- */
  async function fetchTreks() {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/treks`);
      setTreks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- ANALYTICS ---------------- */
  const totalTreks = treks.length;
  const activeTreks = treks.filter((t) => t.is_active).length;
  const offerTreks = treks.filter((t) => t.has_offer).length;

  const difficultyCounts = treks.reduce(
    (acc, t) => {
      const d = (t.difficulty || "").toLowerCase();
      if (d.includes("easy")) acc.easy++;
      else if (d.includes("medium")) acc.medium++;
      else if (d.includes("hard")) acc.hard++;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );

  const recentTreks = [...treks]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5);

  const offerList = treks.filter((t) => t.has_offer);

  const dataIssues = treks.filter(
    (t) =>
      !t.image_url ||
      !t.gallery_images?.length ||
      !t.includes?.length ||
      !t.excludes?.length
  );

  /* ---------------- LOADING SCREEN ---------------- */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bgDark,
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  /* ---------------- MAIN DASHBOARD ---------------- */
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📊 Admin Dashboard</h1>

      {/* Summary Cards */}
      <div style={styles.statsRow}>
        <StatCard label="Total Treks" value={totalTreks} />
        <StatCard label="Active Treks" value={activeTreks} />
        <StatCard label="Treks With Offers" value={offerTreks} />
      </div>

      {/* Difficulty + Offers */}
      <div style={styles.row}>
        <div style={styles.cardWide}>
          <h2 style={styles.cardTitle}>🏔 Treks by Difficulty</h2>

          {renderBar("Easy", difficultyCounts.easy, totalTreks)}
          {renderBar("Medium", difficultyCounts.medium, totalTreks)}
          {renderBar("Hard", difficultyCounts.hard, totalTreks)}

          {totalTreks === 0 && (
            <p style={styles.muted}>No treks yet.</p>
          )}
        </div>

        <div style={styles.cardWide}>
          <h2 style={styles.cardTitle}>🔥 Active Offers</h2>

          {offerList.length === 0 && (
            <p style={styles.muted}>No active offers.</p>
          )}

          {offerList.map((t) => (
            <div key={t._id} style={styles.offerItem}>
              <div>
                <strong>{t.name}</strong>
                <div style={styles.smallText}>{t.offer_title}</div>
              </div>

              <div style={styles.smallText}>
                {t.offer_price_from && t.offer_price_to
                  ? `$${t.offer_price_from} - $${t.offer_price_to}`
                  : "Custom price"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent + Issues */}
      <div style={styles.row}>
        <div style={styles.cardWide}>
          <h2 style={styles.cardTitle}>🕒 Recently Updated</h2>

          {recentTreks.map((t) => (
            <div key={t._id} style={styles.listItem}>
              <div>
                <strong>{t.name}</strong>
                <div style={styles.smallText}>
                  Difficulty: {t.difficulty || "N/A"} • Days: {t.duration_days || "?"}
                </div>
              </div>

              <button
                style={styles.linkButton}
                onClick={() => router.push("/admin/treks")}
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        <div style={styles.cardWide}>
          <h2 style={styles.cardTitle}>⚠ Data Issues</h2>

          {dataIssues.length === 0 && (
            <p style={styles.muted}>All treks look good ✔</p>
          )}

          {dataIssues.slice(0, 6).map((t) => (
            <div key={t._id} style={styles.listItem}>
              <div>
                <strong>{t.name}</strong>
                <div style={styles.smallText}>
                  {!t.image_url && "• Missing image "}
                  {!t.gallery_images?.length && "• Missing gallery "}
                  {!t.includes?.length && "• Missing includes "}
                  {!t.excludes?.length && "• Missing excludes "}
                </div>
              </div>

              <button
                style={styles.linkButton}
                onClick={() => router.push("/admin/treks")}
              >
                Fix
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI Components ---------------- */

function renderBar(label, count, total) {
  const pct = total ? Math.round((count / total) * 100) : 0;

  return (
    <div style={{ marginBottom: "10px" }} key={label}>
      <div style={styles.barLabelRow}>
        <span>{label}</span>
        <span style={styles.smallText}>{count} ({pct}%)</span>
      </div>

      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px",
    background: `linear-gradient(135deg, ${COLORS.bgDark}, ${COLORS.greenDark}, ${COLORS.navy})`,
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },

  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: COLORS.gold,
    marginBottom: "15px",
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
    marginBottom: "25px",
  },

  statCard: {
    background: "rgba(0,0,0,0.6)",
    padding: "16px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.gold}`,
    boxShadow: `0 0 12px ${COLORS.greenDark}88`,
  },

  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: COLORS.gold,
  },

  statLabel: {
    fontSize: "14px",
    color: "#ddd",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "18px",
    marginBottom: "25px",
  },

  cardWide: {
    background: "rgba(0,0,0,0.55)",
    padding: "18px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.gold}`,
    boxShadow: `0 0 15px ${COLORS.greenDark}55`,
  },

  cardTitle: {
    fontSize: "18px",
    color: COLORS.gold,
    marginBottom: "10px",
  },

  muted: {
    fontSize: "14px",
    color: "#ccc",
  },

  smallText: {
    fontSize: "12px",
    color: "#ccc",
  },

  barLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
  },

  barTrack: {
    height: "8px",
    borderRadius: "50px",
    background: "rgba(255,255,255,0.1)",
  },

  barFill: {
    height: "100%",
    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.gold})`,
  },

  offerItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
};
