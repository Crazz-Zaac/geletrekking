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

export default function SuperAdminDashboard() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);

  // dummy stats (replace when booking system exists)
  const [adminCount] = useState(2);
  const [monthlyBookings] = useState(0);
  const [monthlyRevenue] = useState(0);

   // ------------ FETCH TREKS ----------------
  const fetchTreks = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/treks`);
      setTreks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  // ------------ AUTH GUARD (Improved) ----------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // not logged in OR not superadmin
    if (!token || role !== "superadmin") {
      router.replace("/etalogin");
      return;
    }

    // auth success → allow page to load
    setAuthChecked(true);
    fetchTreks();
  }, []);

  if (!authChecked) return null; // prevents flashing UI

 

  // ------------ ANALYTICS ----------------
  const totalTreks = treks.length;
  const activeTreks = treks.filter((t) => t.is_active).length;
  const featuredTreks = treks.filter((t) => t.is_featured).length;
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

  // ------------ LOADING SCREEN ----------------
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bgDark,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  // ------------ MAIN DASHBOARD ----------------
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📊 SuperAdmin Dashboard</h1>

      {/* TOP STAT CARDS */}
      <div style={styles.statsRow}>
        <StatCard label="Total Treks" value={totalTreks} />
        <StatCard label="Active Treks" value={activeTreks} />
        <StatCard label="Featured Treks" value={featuredTreks} />
        <StatCard label="Treks With Offers" value={offerTreks} />
      </div>

      {/* ROW 2: Difficulty + Offers */}
      <div style={styles.row}>
        <div style={styles.cardWide}>
          <h2 style={styles.cardTitle}>🏔 Treks by Difficulty</h2>
          {renderBar("Easy", difficultyCounts.easy, totalTreks)}
          {renderBar("Medium", difficultyCounts.medium, totalTreks)}
          {renderBar("Hard", difficultyCounts.hard, totalTreks)}

          {totalTreks === 0 && <p style={styles.muted}>No treks yet. Add some to see stats.</p>}
        </div>

        <div style={styles.cardWide}>
          <h2 style={styles.cardTitle}>🔥 Active Offers</h2>

          {offerList.length === 0 && <p style={styles.muted}>No active offers.</p>}

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
                {t.offer_valid_to && (
                  <div>Until: {new Date(t.offer_valid_to).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 3: Recent Treks + Issues */}
      <div style={styles.row}>
        <div style={styles.cardWide}>
          <h2 style={styles.cardTitle}>🕒 Recently Updated Treks</h2>

          {recentTreks.length === 0 && <p style={styles.muted}>No treks yet.</p>}

          {recentTreks.map((t) => (
            <div key={t._id} style={styles.listItem}>
              <div>
                <strong>{t.name}</strong>
                <div style={styles.smallText}>
                  Difficulty: {t.difficulty || "N/A"} • Days: {t.duration_days || "?"}
                </div>
              </div>
              <button style={styles.linkButton} onClick={() => router.push("/admin/treks")}>
                Edit
              </button>
            </div>
          ))}
        </div>

        <div style={styles.cardWide}>
          <h2 style={styles.cardTitle}>⚠ Data Quality Issues</h2>

          {dataIssues.length === 0 && <p style={styles.muted}>All treks look good ✔</p>}

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
              <button style={styles.linkButton} onClick={() => router.push("/admin/treks")}>
                Fix
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 4: Admin Info + Future Revenue */}
      <div style={styles.row}>
        <div style={styles.cardWide}>
          <h2 style={styles.cardTitle}>👤 Admin Overview</h2>
          <p style={styles.largeNumber}>{adminCount}</p>

          <p style={styles.muted}>Admins </p>

          
        </div>

        <div style={styles.cardWide}>
          <h2 style={styles.cardTitle}>💰 Bookings & Revenue (Future)</h2>
          <p style={styles.muted}>This will update when booking system is added.</p>

          <div style={styles.bookingRow}>
            <div>
              <div style={styles.label}>Bookings this month</div>
              <div style={styles.largeNumber}>{monthlyBookings}</div>
            </div>
            <div>
              <div style={styles.label}>Revenue this month</div>
              <div style={styles.largeNumber}>${monthlyRevenue}</div>
            </div>
          </div>

          <p style={styles.mutedSmall}>
            Later you can show real booking stats, revenue charts, and top-selling treks here.
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------- Small Bar Chart -------- */
function renderBar(label, count, total) {
  const pct = total ? Math.round((count / total) * 100) : 0;

  return (
    <div style={{ marginBottom: "8px" }} key={label}>
      <div style={styles.barLabelRow}>
        <span>{label}</span>
        <span style={styles.smallText}>
          {count} ({pct}%)
        </span>
      </div>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* -------- Stat Card -------- */
function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

/* -------- STYLES -------- */
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
    marginBottom: "18px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },
  statCard: {
    background: "rgba(0,0,0,0.7)",
    padding: "16px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.gold}`,
    boxShadow: `0 0 12px ${COLORS.greenDark}66`,
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "6px",
  },
  statLabel: {
    fontSize: "14px",
    color: COLORS.gold,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "20px",
  },
  cardWide: {
    background: "rgba(15,15,15,0.75)",
    padding: "18px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.gold}`,
    boxShadow: `0 0 15px ${COLORS.greenDark}55`,
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "12px",
    color: COLORS.gold,
  },
  muted: {
    color: "#cbd5f5",
    fontSize: "14px",
  },
  mutedSmall: {
    color: "#cbd5f5",
    fontSize: "12px",
    marginTop: "8px",
  },
  offerItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  smallText: {
    fontSize: "12px",
    color: "#cbd5f5",
  },
  linkButton: {
    padding: "6px 10px",
    background: COLORS.primary,
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  largeNumber: {
    fontSize: "26px",
    fontWeight: "bold",
  },
  actionButton: {
    padding: "10px 14px",
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.gold})`,
    color: "#000",
    borderRadius: "8px",
    border: `1px solid ${COLORS.gold}`,
    cursor: "pointer",
    marginRight: "8px",
    fontWeight: "bold",
  },
  secondaryButton: {
    padding: "10px 14px",
    background: COLORS.navy,
    color: "#fff",
    borderRadius: "8px",
    border: `1px solid ${COLORS.gold}`,
    cursor: "pointer",
    fontWeight: "bold",
  },
  bookingRow: {
    display: "flex",
    gap: "24px",
    marginTop: "10px",
  },
  label: {
    fontSize: "13px",
    color: COLORS.gold,
  },
  barLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    marginBottom: "2px",
  },
  barTrack: {
    height: "8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
  },
  barFill: {
    height: "100%",
    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.gold})`,
  },
};
