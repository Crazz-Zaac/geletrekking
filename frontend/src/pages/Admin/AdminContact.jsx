// src/pages/admin/AdminContact.jsx
import React from 'react';

const AdminContact = () => {
  // Sample static messages, replace with real data from API/backend
  const messages = [
    { id: 1, name: 'John Doe', email: 'john@example.com', message: 'I have a question about your services.' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', message: 'Please send me your brochure.' },
    { id: 3, name: 'Alex Johnson', email: 'alex@example.com', message: 'I want to book a trek.' },
  ];

  return (
    <div style={containerStyle}>
      <h1>Contact Messages</h1>
      {messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <ul style={listStyle}>
          {messages.map(({ id, name, email, message }) => (
            <li key={id} style={messageCard}>
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Message:</strong> {message}</p>
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

const messageCard = {
  backgroundColor: '#f4f6f8',
  padding: '15px',
  borderRadius: '6px',
  marginBottom: '15px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

export default AdminContact;
