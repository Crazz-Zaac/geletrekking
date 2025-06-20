// src/pages/admin/AdminBlog.jsx
import React from 'react';

const AdminBlog = () => {
  return (
    <div style={containerStyle}>
      <h1>Admin Blog Management</h1>
      <p>Manage blog posts here — create, edit, or delete posts.</p>

      {/* Example blog list */}
      <section style={listStyle}>
        <div style={postStyle}>
          <h3>Blog Post Title 1</h3>
          <p>Short excerpt of the blog post...</p>
        </div>
        <div style={postStyle}>
          <h3>Blog Post Title 2</h3>
          <p>Short excerpt of the blog post...</p>
        </div>
        <div style={postStyle}>
          <h3>Blog Post Title 3</h3>
          <p>Short excerpt of the blog post...</p>
        </div>
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

const postStyle = {
  padding: '15px',
  marginBottom: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '5px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

export default AdminBlog;
