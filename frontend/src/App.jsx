import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Destination from './pages/Destination';
import AnnapurnaBaseCamp from './pages/Destination/AnnapurnaBaseCamp';
import AnnapurnaCircuit from './pages/Destination/AnnapurnaCircuit';
import ClassicAdventure from './pages/Destination/ClassicAdventure';
import IslandPeak from './pages/Destination/IslandPeak';
import ManasluCircuit from './pages/Destination/ManasluCircuit';
import MustangTrek from './pages/Destination/MustangTrek';
import EverestBaseCamp from './pages/Destination/EverestBaseCamp';
import TsumValleyManaslu from './pages/Destination/TsumValleyManaslu';
import Activities from './pages/activities';
import LangtangTrek from './pages/activities/LangtangTrek';
import PeakPeakTrek from './pages/activities/PeakPeakTrek';
import ValleyRimTrek from './pages/activities/ValleyRimTrek';
import Testimonials from './pages/Testimonials';
import Blog from './pages/Blog';
import Contact from './pages/Contact';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';        // Layout with sidebar
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHome from './pages/admin/AdminHome';
import AdminAbout from './pages/admin/AdminAbout';
import AdminGallery from './pages/admin/AdminGallery';
import AdminDestination from './pages/admin/AdminDestination';
import AdminActivities from './pages/admin/AdminActivities';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminBlog from './pages/admin/AdminBlog';
import AdminContact from './pages/admin/AdminContact';

function NavbarControl() {
  const location = useLocation();
  // Hide Navbar on all /admin routes
  if (location.pathname.startsWith('/admin')) return null;
  return <Navbar />;
}

function App() {
  return (
    <Router>
      <NavbarControl />

      <Routes>
        {/* Admin login route (no sidebar) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin routes wrapped with AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="home" element={<AdminHome />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="destination" element={<AdminDestination />} />
          <Route path="activities" element={<AdminActivities />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="contact" element={<AdminContact />} />
        </Route>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />

        {/* Destination Pages */}
        <Route path="/destination" element={<Destination />} />
        <Route path="/destination/annapurna-base-camp" element={<AnnapurnaBaseCamp />} />
        <Route path="/destination/annapurna-circuit" element={<AnnapurnaCircuit />} />
        <Route path="/destination/classic-adventure" element={<ClassicAdventure />} />
        <Route path="/destination/island-peak" element={<IslandPeak />} />
        <Route path="/destination/manaslu-circuit" element={<ManasluCircuit />} />
        <Route path="/destination/mustang-trek" element={<MustangTrek />} />
        <Route path="/destination/everest-base-camp" element={<EverestBaseCamp />} />
        <Route path="/destination/tsum-valley-manaslu" element={<TsumValleyManaslu />} />

        {/* Activities Pages */}
        <Route path="/activities" element={<Activities />} />
        <Route path="/activities/langtang-trek" element={<LangtangTrek />} />
        <Route path="/activities/peak-peak-trek" element={<PeakPeakTrek />} />
        <Route path="/activities/valley-rim-trek" element={<ValleyRimTrek />} />

        {/* Other Pages */}
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
