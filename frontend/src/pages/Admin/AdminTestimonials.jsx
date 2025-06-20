// src/pages/admin/AdminTestimonials.jsx
import React from 'react';

const AdminTestimonials = () => {
  // Example static testimonials data (replace with real API data later)
  const testimonials = [
    {
      id: 1,
      name: 'John Doe',
      message: 'Amazing trekking experience! Highly recommended.',
      date: '2024-01-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      message: 'The guides were very professional and friendly.',
      date: '2024-02-10',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      message: 'Beautiful destinations and great service!',
      date: '2024-03-05',
    },
  ];

  return (
    <div style={containerStyle}>
      <h1>Manage Testimonials</h1>
      {testimonials.length === 0 ? (
        <p>No testimonials available.</p>
      ) : (
        <ul style={listStyle}>
          {testimonials.map(({ id, name, message, date }) => (
            <li key={id} style={testimonialCard}>
              <p><strong>{name}</strong> <em>({new Date(date).toLocaleDateString()})</em></p>
              <p>"{message}"</p>
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

const testimonialCard = {
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '15px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
};

export default AdminTestimonials;
