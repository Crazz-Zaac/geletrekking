// pages/logout.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    // 🧹 Clear login info
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);

    // ✅ Redirect to login page
    router.replace("/etalogin");
  }, [router]);

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "100px",
        fontSize: "18px",
        color: "#333",
      }}
    >
      Logging out...
    </div>
  );
}
