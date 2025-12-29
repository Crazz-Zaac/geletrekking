import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "../context/UserContext";
import Navbar from "../components/Navbar"; // This is your ADMIN NAVBAR
import NavbarUser from "../components/NavbarUser"; // This is USER NAVBAR

// 🛠️ Global styles import
//
// Importing the global stylesheet here ensures that Tailwind CSS is
// properly initialized across the application. Without this import the
// directives declared in `styles/globals.css` (e.g. `@tailwind base;`,
// `@tailwind components;`, and `@tailwind utilities;`) will never be
// included in the compiled CSS bundle, causing Tailwind classes to be
// ignored at runtime.  Moving the import into the custom App module fixes
// the reported issue where Tailwind styles were not working.
import "../styles/globals.css";

function MyApp({ Component, pageProps, router }) {
  // Detect admin or superadmin routes
  const isAdminRoute =
    router.pathname.startsWith("/admin") ||
    router.pathname.startsWith("/superadmin");

  // Hide the navbar on the login page
  const hideNavbar = router.pathname === "/etalogin";

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <UserProvider>
        {/* Show the appropriate navbar unless hidden */}
        {!hideNavbar && (
          isAdminRoute ? <Navbar /> : <NavbarUser />
        )}

        {/* Render the actual page */}
        <Component {...pageProps} />
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default MyApp;
