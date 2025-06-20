// src/pages/admin/AdminDestination.jsx
import React from 'react';

const AdminDestination = () => {
  // Sample static list of destinations, replace with API data later
  const destinations = [
    { id: 1, name: 'Annapurna Base Camp', description: 'A popular trekking route in Nepal.' },
    { id: 2, name: 'Everest Base Camp', description: 'Famous for the highest mountain in the world.' },
    { id: 3, name: 'Mustang Trek', description: 'Known for its unique culture and landscapes.' },
  ];

  return (
    <div style={containerStyle}>
      <h1>Manage Destinations</h1>
      {destinations.length === 0 ? (
        <p>No destinations found.</p>
      ) : (
        <ul style={listStyle}>
          {destinations.map(({ id, name, description }) => (
            <li key={id} style={destinationCard}>
              <h3>{name}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ul>
      )}
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
  listStyleType: 'none',
  padding: 0,
  marginTop: '20px',
};

const destinationCard = {
  backgroundColor: '#f0f3f5',
  padding: '15px',
  borderRadius: '6px',
  marginBottom: '15px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

export default AdminDestination;
