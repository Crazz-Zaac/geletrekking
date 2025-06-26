import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";

export default function AddAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "superadmin") {
      router.replace("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return <p>Loading...</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");
    const newAdminData = { username, email, password };

    try {
      const res = await fetch("http://localhost:5000/api/superadmin/addadmin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAdminData),
      });

      let data;
      try {
        data = await res.json(); // Safe single read
      } catch (jsonErr) {
        const text = await res.text(); // fallback for HTML or plain text
        throw new Error(`Unexpected server response: ${text}`);
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to add admin");
      }

      setMessage("✅ Admin added successfully!");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 400, margin: "auto", paddingTop: 50 }}>
        <h1>Add New Admin</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ display: "block", marginBottom: 10, width: "100%" }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: "block", marginBottom: 10, width: "100%" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: "block", marginBottom: 10, width: "100%" }}
          />
          <button type="submit" style={{ width: "100%" }}>
            Add Admin
          </button>
        </form>

        {message && <p style={{ color: "green", marginTop: 10 }}>{message}</p>}
        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      </div>
    </>
  );
}
