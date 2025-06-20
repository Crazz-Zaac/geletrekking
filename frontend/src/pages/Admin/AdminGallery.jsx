// src/pages/admin/AdminGallery.jsx
import React from 'react';

const AdminGallery = () => {
  // Sample static gallery images (replace with API data later)
  const galleryItems = [
    { id: 1, title: 'Sunset in Annapurna', url: '/images/annapurna-sunset.jpg' },
    { id: 2, title: 'Everest View', url: '/images/everest-view.jpg' },
    { id: 3, title: 'Mustang Landscape', url: '/images/mustang-landscape.jpg' },
  ];

  return (
    <div style={containerStyle}>
      <h1>Manage Gallery</h1>
      {galleryItems.length === 0 ? (
        <p>No gallery images found.</p>
      ) : (
        <div style={galleryGrid}>
          {galleryItems.map(({ id, title, url }) => (
            <div key={id} style={galleryItem}>
              <img src={url} alt={title} style={imageStyle} />
              <p>{title}</p>
            </div>
          ))}
        </div>
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

const galleryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginTop: '20px',
};

const galleryItem = {
  borderRadius: '8px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  textAlign: 'center',
};

const imageStyle = {
  width: '100%',
  height: '150px',
  objectFit: 'cover',
};

export default AdminGallery;
