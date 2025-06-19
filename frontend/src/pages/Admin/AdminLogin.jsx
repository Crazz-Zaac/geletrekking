import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // <-- Import this

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();  // <-- Initialize navigate

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password,
      });

      setMessage(response.data.message);
      console.log('✅ Login successful:', response.data);

      // Redirect to admin contact page after successful login
      navigate('/admin/contactMessages');  // <-- Adjust this path if needed

    } catch (err) {
      console.error('❌ Login error full:', err);
      console.error('Response data:', err.response?.data);
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => (setPassworde.target.value)}
        /><br />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};
export default AdminLogin;
