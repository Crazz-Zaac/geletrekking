import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useRouter } from "next/router";

export default function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const [role, setRole] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = user?.role || localStorage.getItem("role");
      setRole(savedRole);
      setIsLoaded(true);
    }
  }, [user]);

  if (!isLoaded) return null;

  const homeLink =
    role === "superadmin"
      ? "/superadmin"
      : role === "admin"
      ? "/admin"
      : "/";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    router.replace("/etalogin"); // ✅ Redirect to your actual login page
  };

  return (
    <nav style={{ background: "#111", padding: "1rem" }}>
      <ul
        style={{
          listStyle: "none",
          display: "flex",
          gap: "1.2rem",
          margin: 0,
          alignItems: "center",
        }}
      >
        <li>
          <Link href={homeLink} style={{ color: "white", textDecoration: "none" }}>
            Home
          </Link>
        </li>

        {role === "superadmin" && (
          <>
            <li>
              <Link
                href="/superadmin/addadmin"
                style={{ color: "white", textDecoration: "none" }}
              >
                Register Admin
              </Link>
            </li>
            <li>
              <Link
                href="/superadmin/deleteadmin"
                style={{ color: "white", textDecoration: "none" }}
              >
                Delete Admin
              </Link>
            </li>
          </>
        )}

        {(role === "admin" || role === "superadmin") && (
          <li>
            <Link
              href="/admin/create-trek"
              style={{ color: "white", textDecoration: "none" }}
            >
              Create Trek
            </Link>
          </li>
        )}

        {role && (
          <li>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "1rem",
                padding: 0,
              }}
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
