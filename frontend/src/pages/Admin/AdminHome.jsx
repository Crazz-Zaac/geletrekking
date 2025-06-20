// src/pages/admin/Home.jsx
import React from 'react';

const Home = () => {
  return (
    <div style={containerStyle}>
      <h1>Admin Home</h1>
      <p>Welcome to the admin home page. Here you can find quick insights and manage your site.</p>

      <section style={statsContainer}>
        <div style={statCard}>
          <h2>120</h2>
          <p>Active Users</p>
        </div>
        <div style={statCard}>
          <h2>35</h2>
          <p>New Signups</p>
        </div>
        <div style={statCard}>
          <h2>80</h2>
          <p>Pending Approvals</p>
        </div>
      </section>
    </div>
  );
};

const containerStyle = {
  backgroundColor: '#fff',
  borderRadius: '10px',
  padding: '30px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  minHeight: '80vh',
  fontFamily: 'sans-serif',
};

const statsContainer = {
  display: 'flex',
  gap: '20px',
  marginTop: '30px',
  flexWrap: 'wrap',
};

const statCard = {
  flex: '1 1 200px',
  backgroundColor: '#34495e',
  color: '#fff',
  borderRadius: '10px',
  padding: '20px',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
};

export default Home;
