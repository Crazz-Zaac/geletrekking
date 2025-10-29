// context/UserContext.js
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Sync with localStorage & backend
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const storedRole = localStorage.getItem("role");

      // If no token but role exists (e.g., cached menu state)
      if (!token && storedRole) {
        setUser({ role: storedRole });
        setLoading(false);
        return;
      }

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.user) {
          setUser(res.data.user);
          // keep localStorage synced
          if (res.data.user.role)
            localStorage.setItem("role", res.data.user.role);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("❌ Failed to fetch user:", err.response?.data || err.message);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🔹 Instantly sync user context after login
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (token && role) setUser({ role });
      else setUser(null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </UserContext.Provider>
  );
};
