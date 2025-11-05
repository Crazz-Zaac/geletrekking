"use client";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { UserContext } from "../../context/UserContext";

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

  /* ✅ GET admins list */
  const fetchAdmins = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/admins`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setAdmins(res.data);
  };

  /* ✅ DELETE admin (not superadmin) */
  const deleteAdmin = async (id, role) => {
    if (role === "superadmin") return alert("❌ Cannot delete superadmin");

    if (!confirm("Are you sure you want to delete this admin?")) return;

    const token = localStorage.getItem("token");
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/admins/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchAdmins();
  };

  /* ✅ CREATE admin */
  const createAdmin = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

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
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      
      {/* Sidebar */}
      <div style={{ width: "25%", background: "#111", color: "white", padding: "20px" }}>
        <h2>Admin Panel</h2>
        <button onClick={() => router.push("/superadmin")} style={navBtn}>
          ⬅ Back
        </button>
      </div>

      {/* Admin management panel */}
      <div style={{ width: "75%", padding: "25px", background: "#f8f8f8" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2>Manage Admins</h2>
          <button onClick={() => setShowCreateModal(true)} style={btnPrimary}>
            ➕ Create Admin
          </button>
        </div>

        {/* Admin list */}
        <div style={{ background: "#fff", padding: "15px", borderRadius: "8px", border: "1px solid #ddd" }}>
          {admins.map((admin) => (
            <div key={admin._id} style={adminRow}>
              <div>
                <strong>{admin.email}</strong>
                <span style={{ marginLeft: "8px", color: admin.role === "superadmin" ? "#FFD700" : "#888" }}>
                  ({admin.role})
                </span>
              </div>

              {admin.role !== "superadmin" && (
                <button onClick={() => deleteAdmin(admin._id, admin.role)} style={btnDanger}>
                  ❌ Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Create Modal */}
      {showCreateModal && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <h3>Create Admin</h3>

            <form onSubmit={createAdmin}>
              <input
                placeholder="Email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                required
                style={input}
              />

              <input
                placeholder="Password"
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                required
                style={input}
              />

              {/* ✅ Only Admin option — no Superadmin */}
              <select
                value={newAdmin.role}
                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                style={input}
              >
                <option value="admin">Admin</option>
              </select>

              <button type="submit" style={btnPrimary}>✅ Create</button>
              <button type="button" style={btnSecondary} onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ✅ Styles */
const navBtn = { width: "100%", background: "#444", padding: "10px", borderRadius: "6px", color: "white", border: "none", cursor: "pointer", marginTop: "15px" };
const adminRow = { display: "flex", justifyContent: "space-between", padding: "12px", borderBottom: "1px solid #eee" };
const btnPrimary = { background: "#0a472e", padding: "10px 15px", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" };
const btnSecondary = { background: "#777", padding: "8px 12px", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "10px" };
const btnDanger = { background: "#d7263d", padding: "6px 12px", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" };
const input = { width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #aaa" };
const modalBackdrop = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" };
const modalBox = { background: "white", padding: "20px", width: "350px", borderRadius: "8px" };
