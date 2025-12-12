import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "../context/UserContext";
import Navbar from "../components/Navbar"; // This is your ADMIN NAVBAR
import NavbarUser from "../components/NavbarUser"; // This is USER NAVBAR

function MyApp({ Component, pageProps, router }) {
  // Detect admin or superadmin routes
  const isAdminRoute =
    router.pathname.startsWith("/admin") ||
    router.pathname.startsWith("/superadmin");

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <UserProvider>

        {/* Admin pages show ADMIN navbar */}
        {isAdminRoute && <Navbar />}

        {/* User pages show USER navbar */}
        {!isAdminRoute && <NavbarUser />}

        {/* Render the actual page */}
        <Component {...pageProps} />

      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default MyApp;
