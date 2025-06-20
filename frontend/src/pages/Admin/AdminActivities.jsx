// src/pages/admin/AdminActivities.jsx
import React from 'react';

const AdminActivities = () => {
  return (
    <div style={containerStyle}>
      <h1>Admin Activities</h1>
      <p>Manage all activities here. You can add, edit, or delete activities.</p>

      {/* Example content */}
      <section style={listStyle}>
        <div style={itemStyle}>Activity 1 - Hiking</div>
        <div style={itemStyle}>Activity 2 - Trekking</div>
        <div style={itemStyle}>Activity 3 - Mountaineering</div>
      </section>
    </div>
  );
};

const containerStyle = {
  padding: '20px',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#fff',
  borderRadius: '8px',
  minHeight: '80vh',
};

const listStyle = {
  marginTop: '20px',
};

const itemStyle = {
  padding: '10px',
  marginBottom: '10px',
  backgroundColor: '#ecf0f1',
  borderRadius: '5px',
};

export default AdminActivities;
