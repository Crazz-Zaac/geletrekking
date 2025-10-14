import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "../context/UserContext";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

function MyApp({ Component, pageProps, router }) {
  const showAdminNavbar =
    router.pathname.startsWith("/admin") ||
    router.pathname.startsWith("/superadmin");

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <UserProvider>
        {showAdminNavbar && <Navbar />}
        <Component {...pageProps} />
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default MyApp;
