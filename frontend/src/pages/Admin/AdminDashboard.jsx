// src/pages/admin/AdminDashboard.jsx
import React from 'react';

const AdminDashboard = () => {
  return (
    <div>
      <header style={{ marginBottom: '20px' }}>
        <h1>Welcome to the Admin Dashboard</h1>
        <p>This is your control center.</p>
      </header>

      <section style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={cardStyle}>
          <h3>12</h3>
          <p>Total Destinations</p>
        </div>
        <div style={cardStyle}>
          <h3>5</h3>
          <p>Total Blog Posts</p>
        </div>
        <div style={cardStyle}>
          <h3>32</h3>
          <p>Total Testimonials</p>
        </div>
        <div style={cardStyle}>
          <h3>14</h3>
          <p>Contact Messages</p>
        </div>
      </section>
    </div>
  );
};

const cardStyle = {
  flex: '1 1 200px',
  backgroundColor: '#fff',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  textAlign: 'center',
};

export default AdminDashboard;
