// src/pages/admin/AdminAbout.jsx
import React from 'react';

const AdminAbout = () => {
  return (
    <div style={containerStyle}>
      <h1>About Us - Admin Panel</h1>
      <p>This page is for managing and updating the About Us content.</p>
      <p>You can add more controls here later for editing and saving info.</p>
    </div>
  );
};

const containerStyle = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  fontFamily: 'sans-serif',
  minHeight: '80vh',
};

export default AdminAbout;
