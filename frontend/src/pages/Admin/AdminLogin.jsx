// src/pages/admin/AdminLogin.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css'; // ✅ Import the CSS

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password,
      });

      setMessage(response.data.message);
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
      }

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="admin-body">
      <div className="login-container">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
};

export default AdminLogin;
