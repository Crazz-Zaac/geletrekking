import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import AdminLogin from './pages/Admin/AdminLogin';

import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';

// Destination Main and Subpages
import Destination from './pages/Destination';
import AnnapurnaBaseCamp from './pages/Destination/AnnapurnaBaseCamp';
import AnnapurnaCircuit from './pages/Destination/AnnapurnaCircuit';
import ClassicAdventure from './pages/Destination/ClassicAdventure';
import IslandPeak from './pages/Destination/IslandPeak';
import ManasluCircuit from './pages/Destination/ManasluCircuit';
import MustangTrek from './pages/Destination/MustangTrek';
import EverestBaseCamp from './pages/Destination/EverestBaseCamp';
import TsumValleyManaslu from './pages/Destination/TsumValleyManaslu';

// Activities Main and Subpages
import Activities from './pages/Activities';
import LangtangTrek from './pages/Activities/LangtangTrek';
import PeakPeakTrek from './pages/Activities/PeakPeakTrek';
import ValleyRimTrek from './pages/Activities/ValleyRimTrek';

import Testimonials from './pages/Testimonials';
import Blog from './pages/Blog';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      {/* Show Navbar on all pages except admin login */}
      {window.location.pathname !== '/admin/login' && <Navbar />}

      <Routes>
        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Main Pages */}
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
