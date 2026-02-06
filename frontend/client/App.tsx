import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public pages
import Index from "./pages/Index";
import About from "./pages/About";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import Gallery from "./pages/Gallery";
import Activities from "./pages/Activities";
import OptionalTreks from "./pages/OptionalTreks";
import OptionalTrekDetail from "./pages/OptionalTrekDetail";
import Testimonials from "./pages/Testimonials";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Admin
import AdminLogin from "./pages/admin/Login";
import RequireAdmin from "./pages/admin/RequireAdmin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSettings from "./pages/admin/Settings";
import AdminHero from "./pages/admin/Hero";
import TreksList from "./pages/admin/TreksList";
import TrekForm from "./pages/admin/TrekForm";
import AdminBlogs from "./pages/admin/Blogs";
import AdminGallery from "./pages/admin/Gallery";
import AdminTestimonials from "./pages/admin/Testimonials";
import AdminAbout from "./pages/admin/About";
import Admins from "./pages/admin/Admins";
import AdminMessages from "./pages/admin/AdminMessages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destination/:id" element={<DestinationDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/optional-treks" element={<OptionalTreks />} />
          <Route path="/optional-trek/:id" element={<OptionalTrekDetail />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="hero" element={<AdminHero />} />
              {/* Trek Routes */}
              <Route path="treks" element={<TreksList />} />
              <Route path="treks/create" element={<TrekForm />} />
              <Route path="treks/edit/:id" element={<TrekForm />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="about" element={<AdminAbout />} />
              <Route path="messages" element={<AdminMessages />} />
              {/* 🔐 Superadmin only */}
              <Route path="admins" element={<Admins />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);