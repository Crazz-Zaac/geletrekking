import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const liStyle = {
    cursor: 'pointer',
    padding: '8px 12px',
    marginBottom: '8px',
    borderRadius: '4px',
    backgroundColor: '#34495e',
    color: '#fff',
    userSelect: 'none',
    transition: 'background-color 0.3s ease',
  };

  const liHoverStyle = {
    backgroundColor: '#1abc9c',
  };

  // Correct admin paths here
  const menuItems = [
    { label: '🏠 Home', path: '/admin/home' },
    { label: 'ℹ️ About Us', path: '/admin/about' },
    { label: '🖼️ Gallery', path: '/admin/gallery' },
    { label: '🗻 Destinations', path: '/admin/destination' },
    { label: '🥾 Activities', path: '/admin/activities' },
    { label: '💬 Testimonials', path: '/admin/testimonials' },
    { label: '📝 Blog', path: '/admin/blog' },
    { label: '📨 Contact', path: '/admin/contact' },
    { label: '🚪 Logout', path: '/admin/login' },
  ];

  const goTo = (path) => () => navigate(path);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: '250px',
        backgroundColor: '#2c3e50',
        color: '#fff',
        padding: '20px',
      }}>
        <h2>Admin Panel</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {menuItems.map((item, index) => (
            <li
              key={item.path}
              onClick={goTo(item.path)}
              style={{
                ...liStyle,
                ...(hoveredIndex === index ? liHoverStyle : {}),
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </aside>

      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
