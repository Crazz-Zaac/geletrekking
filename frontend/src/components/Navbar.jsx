import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showActivitiesDropdown, setShowActivitiesDropdown] = useState(false);

  return (
    <nav>
      <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem', margin: 0, padding: 0 }}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/gallery">Gallery</Link></li>

        {/* Destination Dropdown */}
        <li
          onMouseEnter={() => setShowDestinationDropdown(true)}
          onMouseLeave={() => setShowDestinationDropdown(false)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <Link to="/destination" style={{ display: 'inline-block' }}>
            Destination ▼
          </Link>

          {showDestinationDropdown && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: '#fff',
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              listStyle: 'none',
              margin: 0,
              zIndex: 1000,
              minWidth: '200px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <li><Link to="/destination/annapurna-base-camp">Annapurna Base Camp</Link></li>
              <li><Link to="/destination/annapurna-circuit">Annapurna Circuit</Link></li>
              <li><Link to="/destination/classic-adventure">Combined Classic Adventure</Link></li>
              <li><Link to="/destination/island-peak">Island Peak</Link></li>
              <li><Link to="/destination/manaslu-circuit">Manaslu Circuit</Link></li>
              <li><Link to="/destination/mustang-trek">Mustang Trek</Link></li>
              <li><Link to="/destination/everest-base-camp">Sagarmatha (Everest) Base Camp</Link></li>
              <li><Link to="/destination/tsum-valley-manaslu">Tsum Valley and Manaslu Trek</Link></li>
            </ul>
          )}
        </li>

        {/* Optional Activities Dropdown */}
        <li
          onMouseEnter={() => setShowActivitiesDropdown(true)}
          onMouseLeave={() => setShowActivitiesDropdown(false)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <Link to="/activities" style={{ display: 'inline-block' }}>
            Optional Activities ▼
          </Link>

          {showActivitiesDropdown && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: '#fff',
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              listStyle: 'none',
              margin: 0,
              zIndex: 1000,
              minWidth: '200px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <li><Link to="/activities/langtang-trek">Langtang Trek</Link></li>
              <li><Link to="/activities/peak-peak-trek">Peak Peak Trek</Link></li>
              <li><Link to="/activities/valley-rim-trek">Valley Rim Trek</Link></li>
            </ul>
          )}
        </li>

        <li><Link to="/testimonials">Testimonials</Link></li>
        <li><Link to="/blog">Blog</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
