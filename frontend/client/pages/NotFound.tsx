import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-brand-dark mb-4">404</h1>
          <p className="text-2xl text-gray-600 mb-4">Page not found</p>
          <p className="text-gray-500 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-brand-accent hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
