import { useState } from 'react';
import { useRouter } from 'next/router';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function Login() {
  // ===== STATE =====
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [need2FA, setNeed2FA] = useState(false);
  const [loginMethod, setLoginMethod] = useState(''); // 'manual' or 'google'
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);

  const router = useRouter();

  // ===== ROLE-BASED ROUTING =====
  const handleRoutingByRole = (role) => {
    if (role === 'admin') router.push('/admin');
    else if (role === 'superadmin') router.push('/superadmin');
    else router.push('/');
  };

  // ===== MANUAL LOGIN =====
  const handleLogin = async () => {
    setError('');
    setLoginMethod('manual');

    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    try {
      const payload = { email, password };
      if (need2FA) payload.twoFactorCode = twoFactorCode;

      const res = await fetch('http://localhost:5000/api/superadmin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // ✅ Handle both 2FA trigger and success login
      if (data.need2FA || data.message?.includes('2FA')) {
        setNeed2FA(true);
        setError('Enter the 2FA code sent to your email');
        return;
      }

      if (data?.token && data?.user?.role) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        handleRoutingByRole(data.user.role);
        return;
      }

      setError(data.message || 'Login failed');
    } catch (err) {
      console.error('Manual login error:', err);
      setError('Server error. Try again later.');
    }
  };

  // ===== GOOGLE LOGIN SUCCESS =====
  const handleGoogleSuccess = async (response) => {
    setError('');
    setLoginMethod('google');
    setNeed2FA(false);
    setPendingGoogleToken(response.credential);

    try {
      const res = await axios.post('http://localhost:5000/api/superadmin/auth/google-login', {
        token: response.credential,
      });

      const resData = res.data;

      // ✅ Handle Google 2FA
      if (resData.need2FA || resData.message?.includes('2FA')) {
        setNeed2FA(true);
        setError('Enter the 2FA code sent to your email');
        return;
      }

      if (resData?.token && resData?.user?.role) {
        localStorage.setItem('token', resData.token);
        localStorage.setItem('role', resData.user.role);
        handleRoutingByRole(resData.user.role);
      } else {
        setError('Google login succeeded, but user data is missing.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.response?.data?.message || 'Google login failed');
    }
  };

  // ===== GOOGLE 2FA SUBMIT =====
  const handleGoogle2FASubmit = async () => {
    setError('');
    if (!twoFactorCode) {
      setError('Please enter the 2FA code sent to your email');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/superadmin/auth/google-login', {
        token: pendingGoogleToken,
        twoFactorCode,
      });

      const resData = res.data;

      if (resData?.token && resData?.user?.role) {
        localStorage.setItem('token', resData.token);
        localStorage.setItem('role', resData.user.role);
        handleRoutingByRole(resData.user.role);
      } else {
        setError('Login succeeded, but user data is missing.');
      }
    } catch (err) {
      setError(err.response?.data?.message || '2FA verification failed');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔐 Login</h2>

      {/* Step 1: Manual Login Form */}
      {!need2FA && (
        <>
          <input
            type="email"
            placeholder="📧 Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="🔑 Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          {error && <p style={error.includes('sent') ? styles.successMsg : styles.errorMsg}>{error}</p>}
          <button style={styles.buttonPrimary} onClick={handleLogin}>Login</button>
        </>
      )}

      {/* Step 2: Manual 2FA */}
      {need2FA && loginMethod === 'manual' && (
        <>
          <input
            type="text"
            placeholder="🔒 Enter 2FA code"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            style={styles.input}
          />
          <button style={styles.buttonPrimary} onClick={handleLogin}>Submit 2FA Code</button>
          {error && <p style={error.includes('sent') ? styles.successMsg : styles.errorMsg}>{error}</p>}
        </>
      )}

      {/* Step 3: Google 2FA */}
      {need2FA && loginMethod === 'google' && (
        <>
          <input
            type="text"
            placeholder="🔒 Enter 2FA code"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            style={styles.input}
          />
          <button style={styles.buttonPrimary} onClick={handleGoogle2FASubmit}>Submit 2FA Code</button>
          {error && <p style={error.includes('sent') ? styles.successMsg : styles.errorMsg}>{error}</p>}
        </>
      )}

      {/* Step 4: Google Login */}
      {!need2FA && (
        <div style={{ marginTop: '1rem' }}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google login failed')} />
        </div>
      )}
    </div>
  );
}

// ===== SIMPLE INLINE STYLES =====
const styles = {
  container: {
    maxWidth: '400px',
    margin: 'auto',
    padding: '2rem',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: { marginBottom: '1.5rem' },
  input: {
    width: '100%',
    padding: '0.8rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  buttonPrimary: {
    width: '100%',
    padding: '0.8rem',
    background: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  errorMsg: { color: 'red', marginBottom: '1rem' },
  successMsg: { color: 'green', marginBottom: '1rem' },
};
