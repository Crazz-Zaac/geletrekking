import { useState } from 'react';
import { useRouter } from 'next/router';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Shared route handler
  const handleRoutingByRole = (role) => {
    if (role === 'admin') router.push('/admin');
    else if (role === 'superadmin') router.push('/superadmin');
    else router.push('/');
  };

  const handleLogin = async (role) => {
    setError('');

    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    const loginUrl = 'http://localhost:5000/api/superadmin/auth/login';

    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }), // ✅ Send role here
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      console.log('Manual Login Response:', data);

      if (data?.token && data?.user?.role) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        handleRoutingByRole(data.user.role);
      } else {
        setError('Login succeeded, but user data is missing.');
        console.error('Unexpected login response:', data);
      }
    } catch (err) {
      console.error('Manual login error:', err);
      setError('Server error. Try again later.');
    }
  };

  const handleGoogleSuccess = async (response) => {
    console.log('Google Login Response:', response);

    try {
      const { credential } = response;

      if (!credential) {
        setError('Google credential missing');
        return;
      }

      const res = await axios.post('http://localhost:5000/api/superadmin/auth/google-login', {
        token: credential,
      });

      const resData = res.data;
      console.log('Backend Google Login Response:', resData);

      if (resData?.token && resData?.user?.role) {
        localStorage.setItem('token', resData.token);
        localStorage.setItem('role', resData.user.role);
        handleRoutingByRole(resData.user.role);
      } else {
        setError('Google login succeeded, but user data is missing.');
        console.error('Unexpected Google login response:', resData);
      }
    } catch (err) {
      console.error('Google login failed:', err);
      setError(err.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
      <h2>Login</h2>

      <label>Email:</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      <label>Password:</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={() => handleLogin('superadmin')}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
      >
        Login as Superadmin
      </button>

      <button
        onClick={() => handleLogin('admin')}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      >
        Login as Admin
      </button>

      <hr style={{ margin: '1rem 0' }} />

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => setError('Google login failed')}
      />
    </div>
  );
}
