import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuperadmin, setIsSuperadmin] = useState(false); // toggle login type
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const loginUrl = isSuperadmin 
      ? 'http://localhost:5000/api/superadmin/auth/login' 
      : 'http://localhost:5000/api/userauth/login';

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

      // Save token and role in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role || data.user.role); // handle both user and superadmin response

      // Redirect based on role
      const role = data.role || data.user.role;
      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'superadmin') {
        router.push('/superadmin');
      } else {
        router.push('/'); // or user home page
      }
    } catch (err) {
      setError('Server error. Try again later.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
      <h2>Login</h2>

      <label style={{ display: 'block', marginBottom: '1rem' }}>
        <input
          type="checkbox"
          checked={isSuperadmin}
          onChange={() => setIsSuperadmin(!isSuperadmin)}
          style={{ marginRight: '0.5rem' }}
        />
        Login as Superadmin
      </label>

      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '1rem' }}
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '1rem' }}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ width: '100%', padding: '0.5rem' }}>
          Login
        </button>
      </form>
    </div>
  );
}
