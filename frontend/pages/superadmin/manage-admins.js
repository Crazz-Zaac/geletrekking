"use client";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { UserContext } from "../../context/UserContext";

const COLORS = {
  primary: "#e84610",
  gold: "#fed81e",
  greenDark: "#2a3a19",
  navy: "#282c62",
  bgDark: "#0a0f14",
};

export default function ManageAdmins() {
  const router = useRouter();
  const { user } = useContext(UserContext);

  const [admins, setAdmins] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newAdmin, setNewAdmin] = useState({
    email: "",
    password: "",
    role: "admin",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const r = localStorage.getItem("role");

    if (!token || r !== "superadmin") {
      router.push("/etalogin");
      return;
    }

    fetchAdmins();
  }, []);

  /* Fetch all admins */
  const fetchAdmins = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/admins`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setAdmins(res.data);
  };

  /* Delete admin */
  const deleteAdmin = async (id, role) => {
    if (role === "superadmin") return alert("❌ Cannot delete superadmin");

    if (!confirm("Are you sure you want to delete this admin?")) return;

    const token = localStorage.getItem("token");
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/admins/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchAdmins();
  };

  /* Create new admin */
  const createAdmin = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/admins`,
      newAdmin,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("✅ Admin Created");
    setShowCreateModal(false);
    setNewAdmin({ email: "", password: "", role: "admin" });
    fetchAdmins();
  };

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>⚙ Admin Controls</h2>

        <button onClick={() => router.push("/superadmin")} style={styles.sidebarBtn}>
          ⬅ Back to Dashboard
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>Manage Admins</h2>

          <button onClick={() => setShowCreateModal(true)} style={styles.btnPrimary}>
            ➕ Create Admin
          </button>
        </div>

        <div style={styles.adminList}>
          {admins.map((admin) => (
            <div key={admin._id} style={styles.adminRow}>
              <div>
                <strong style={{ color: COLORS.gold }}>{admin.email}</strong>
                <span
                  style={{
                    marginLeft: "8px",
                    color: admin.role === "superadmin" ? COLORS.gold : "#bbb",
                    fontSize: "13px",
                  }}
                >
                  ({admin.role})
                </span>
              </div>

              {admin.role !== "superadmin" && (
                <button
                  onClick={() => deleteAdmin(admin._id, admin.role)}
                  style={styles.btnDanger}
                >
                  ❌ Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CREATE ADMIN MODAL */}
      {showCreateModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>Create New Admin</h3>

            <form onSubmit={createAdmin}>
              <input
                placeholder="Email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                required
                style={styles.input}
              />

              <input
                placeholder="Password"
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                required
                style={styles.input}
              />

              <select
                value={newAdmin.role}
                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                style={styles.input}
              >
                <option value="admin">Admin</option>
              </select>

              <div style={styles.modalBtnRow}>
                <button type="submit" style={styles.btnPrimary}>
                  ✅ Create
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={styles.btnSecondary}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- STYLES -------------------- */

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: `linear-gradient(135deg, ${COLORS.bgDark}, ${COLORS.greenDark}, ${COLORS.navy})`,
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },

  /* SIDEBAR */
  sidebar: {
    width: "25%",
    background: "rgba(0,0,0,0.4)",
    padding: "25px",
    borderRight: `2px solid ${COLORS.gold}`,
  },
  sidebarTitle: {
    fontSize: "22px",
    color: COLORS.gold,
    marginBottom: "20px",
  },
  sidebarBtn: {
    width: "100%",
    padding: "12px",
    background: COLORS.primary,
    borderRadius: "8px",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },

  /* MAIN SECTION */
  main: {
    width: "75%",
    padding: "30px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  heading: {
    fontSize: "26px",
    color: COLORS.gold,
  },

  adminList: {
    background: "rgba(0,0,0,0.5)",
    padding: "15px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.greenDark}`,
  },
  adminRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 5px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  /* BUTTONS */
  btnPrimary: {
    padding: "10px 16px",
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.gold})`,
    borderRadius: "8px",
    border: `1px solid ${COLORS.gold}`,
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "10px 16px",
    background: COLORS.navy,
    color: "#fff",
    borderRadius: "8px",
    border: `1px solid ${COLORS.gold}`,
    cursor: "pointer",
  },
  btnDanger: {
    padding: "8px 14px",
    background: "#d7263d",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },

  /* INPUTS */
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.gold}`,
    background: "#111",
    color: "#fff",
  },

  /* MODAL */
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    width: "360px",
    background: COLORS.bgDark,
    padding: "20px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.gold}`,
  },
  modalTitle: {
    color: COLORS.gold,
    marginBottom: "15px",
  },
  modalBtnRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
};
