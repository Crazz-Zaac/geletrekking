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
  const [pendingRole, setPendingRole] = useState('');
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
  const [loginMethod, setLoginMethod] = useState(''); // Tracks if login is 'manual' or 'google'

  const router = useRouter();

  // ===== ROLE-BASED ROUTING =====
  const handleRoutingByRole = (role) => {
    if (role === 'admin') router.push('/admin');
    else if (role === 'superadmin') router.push('/superadmin');
    else router.push('/');
  };

  // ===== MANUAL LOGIN =====
  const handleLogin = async (role) => {
    setError('');
    setLoginMethod('manual');

    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    try {
      const payload = { email, password, role };
      if (need2FA) payload.twoFactorCode = twoFactorCode;

      const res = await fetch('http://localhost:5000/api/superadmin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // If backend asks for 2FA
        if (res.status === 401 && data.message === '2FA code sent to your email') {
          setNeed2FA(true);
          setPendingRole(role);
          setError('Enter the 2FA code sent to your email');
          return;
        }
        setError(data.message || 'Login failed');
        return;
      }

      // Successful login
      if (data?.token && data?.user?.role) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        handleRoutingByRole(data.user.role);
      } else {
        setError('Login succeeded, but user data is missing.');
      }
    } catch (err) {
      console.error('Manual login error:', err);
      setError('Server error. Try again later.');
    }
  };

  // ===== MANUAL 2FA REQUEST =====
  const request2FACodeManual = async () => {
    setError('');
    if (!email || !pendingRole) {
      setError('Please enter your email and select role first');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/superadmin/auth/send-2fa-code', {
        email,
        role: pendingRole,
      });
      setError('2FA code sent to your email.');
      setNeed2FA(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send 2FA code');
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

      if (resData?.token && resData?.user?.role) {
        localStorage.setItem('token', resData.token);
        localStorage.setItem('role', resData.user.role);
        handleRoutingByRole(resData.user.role);
      } else {
        setError('Google login succeeded, but user data is missing.');
      }
    } catch (err) {
      if (err.response?.status === 401 && err.response?.data?.message === '2FA code sent to your email') {
        setNeed2FA(true);
        setError('Enter the 2FA code sent to your email');
      } else {
        setError(err.response?.data?.message || 'Google login failed');
      }
    }
  };

  // ===== GOOGLE 2FA REQUEST =====
  const request2FACodeGoogle = async () => {
    setError('');
    if (!pendingGoogleToken) {
      setError('No Google token found. Please login again.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/superadmin/auth/send-2fa-code', {
        token: pendingGoogleToken,
      });
      setError('2FA code sent to your email.');
      setNeed2FA(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send 2FA code');
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
          <button style={styles.buttonPrimary} onClick={() => { setPendingRole('superadmin'); handleLogin('superadmin'); }}>Login</button>
          {/* <button style={styles.buttonSecondary} onClick={() => { setPendingRole('admin'); handleLogin('admin'); }}>Login as Admin</button> */}
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
          <button style={styles.buttonPrimary} onClick={() => handleLogin(pendingRole)}>Submit 2FA Code</button>
          <button style={styles.buttonWarning} onClick={request2FACodeManual}>Send 2FA Code Again</button>
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
          <button style={styles.buttonWarning} onClick={request2FACodeGoogle}>Send 2FA Code Again</button>
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
  buttonSecondary: {
    width: '100%',
    padding: '0.8rem',
    background: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    marginBottom: '1rem',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  buttonWarning: {
    width: '100%',
    padding: '0.8rem',
    background: '#f0ad4e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    marginBottom: '1rem',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  errorMsg: { color: 'red', marginBottom: '1rem' },
  successMsg: { color: 'green', marginBottom: '1rem' },
};
