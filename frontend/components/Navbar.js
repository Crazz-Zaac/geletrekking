// components/Navbar.js
import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function Navbar() {
  const { user } = useContext(UserContext);

  return (
    <nav style={{ background: "#333", padding: "1rem" }}>
      <ul style={{ listStyle: "none", display: "flex", gap: "1rem", margin: 0 }}>
        <li>
          <Link href="/" style={{ color: "white", textDecoration: "none" }}>
            Home
          </Link>
        </li>

        {/* Superadmin links */}
        {user?.role === "superadmin" && (
          <>
            <li>
              <Link href="/superadmin/addadmin" style={{ color: "white", textDecoration: "none" }}>
                Register
              </Link>
            </li>
            <li>
              <Link href="/superadmin/deleteadmin" style={{ color: "white", textDecoration: "none" }}>
                Delete Admin
              </Link>
            </li>
          </>
        )}

        {/* Admin links */}
        {(user?.role === "admin" || user?.role === "superadmin") && (
          <li>
            <Link href="/admin/create-trek" style={{ color: "white", textDecoration: "none" }}>
              Create Trek
            </Link>
          </li>
        )}

        {/* Common links for all logged-in users */}
        {user && (
          <li>
            <Link href="/logout" style={{ color: "white", textDecoration: "none" }}>
              Logout
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
