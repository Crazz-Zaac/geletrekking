import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (role) => {
    setError('');

    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    const loginUrl =
      role === 'superadmin'
        ? 'http://localhost:5000/api/superadmin/auth/login'
        : 'http://localhost:5000/api/superadmin/auth/login';
        

    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'superadmin') {
        router.push('/superadmin');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Server error. Try again later.');
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
        style={{ width: '100%', padding: '0.5rem' }}
      >
        Login as Admin
      </button>
    </div>
  );
}
