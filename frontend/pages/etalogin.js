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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== GOOGLE LOGIN SUCCESS =====
  const handleGoogleSuccess = async (response) => {
    setError('');
    setLoginMethod('google');
    setNeed2FA(false);
    setPendingGoogleToken(response.credential);

    try {
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      <div style={styles.card}>
        {/* Logo / Badge */}
       <div style={styles.logoWrapper}>
          <img
            src="/logo.png"   
            alt="Logo"
            style={styles.logoImage}
          />
        </div>


        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>
          Sign in to your <span style={styles.brand}>GeleTrekking</span> dashboard
        </p>

        {/* Error / info */}
        {error && (
          <p
            style={
              error.toLowerCase().includes('sent')
                ? styles.successMsg
                : styles.errorMsg
            }
          >
            {error}
          </p>
        )}

        {/* Step 1 & Step 2: Manual login + 2FA */}
        {!need2FA && (
          <>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
              <div style={styles.helperRow}>
                <span style={styles.helperText}>Use a strong, unique password</span>
                <button style={styles.linkButton} type="button">
                  Forgot?
                </button>
              </div>
            </div>

            <button
              style={{
                ...styles.buttonPrimary,
                ...(isSubmitting ? styles.buttonDisabled : {}),
              }}
              onClick={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in…' : 'Login'}
            </button>
          </>
        )}

        {need2FA && loginMethod === 'manual' && (
          <>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>2FA Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                style={styles.input}
              />
              <span style={styles.helperText}>
                Check your email for the verification code.
              </span>
            </div>

            <button
              style={{
                ...styles.buttonPrimary,
                ...(isSubmitting ? styles.buttonDisabled : {}),
              }}
              onClick={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying…' : 'Submit 2FA Code'}
            </button>
          </>
        )}

        {need2FA && loginMethod === 'google' && (
          <>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>2FA Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                style={styles.input}
              />
              <span style={styles.helperText}>
                Check your email for the verification code.
              </span>
            </div>

            <button
              style={{
                ...styles.buttonPrimary,
                ...(isSubmitting ? styles.buttonDisabled : {}),
              }}
              onClick={handleGoogle2FASubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying…' : 'Submit 2FA Code'}
            </button>
          </>
        )}

        {/* Divider */}
        {!need2FA && (
          <>
            <div style={styles.dividerRow}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>or continue with</span>
              <span style={styles.dividerLine} />
            </div>

            {/* Step 4: Google Login */}
            <div style={styles.googleWrapper}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed')}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `
      radial-gradient(circle at top left, #e84610 0, transparent 45%),
      radial-gradient(circle at bottom right, #282c62 0, transparent 40%),
      linear-gradient(135deg, #2a3a19, #000)
    `,
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
  },

  // Glow orbs using your brand colors
  glow1: {
    position: 'absolute',
    width: '420px',
    height: '420px',
    borderRadius: '999px',
    background: 'radial-gradient(circle, rgba(232,70,16,0.45), transparent)',
    top: '-120px',
    left: '-80px',
    filter: 'blur(15px)',
    opacity: 0.7,
  },
  glow2: {
    position: 'absolute',
    width: '380px',
    height: '380px',
    borderRadius: '999px',
    background: 'radial-gradient(circle, rgba(40,44,98,0.45), transparent)',
    bottom: '-140px',
    right: '-60px',
    filter: 'blur(15px)',
    opacity: 0.65,
  },

  // Glass card
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '420px',
    borderRadius: '24px',
    padding: '2.4rem 2.1rem 2.7rem',
    background:
      'linear-gradient(135deg, rgba(20,20,35,0.85), rgba(20,20,35,0.92))',
    border: '1px solid rgba(254,216,30,0.3)', // yellow accent border
    backdropFilter: 'blur(18px)',
    color: '#f6f6f6',
    boxShadow:
      '0 18px 45px rgba(0,0,0,0.55), 0 0 25px rgba(40,44,98,0.35)',
    zIndex: 10,
  },

  // Custom logo
  logoWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.6rem',
  },
  logoImage: {
    width: '90px',
    height: '90px',
    objectFit: 'contain',
    borderRadius: '14px',
    boxShadow: `
      0 6px 18px rgba(0,0,0,0.5),
      0 0 12px rgba(254,216,30,0.6)
    `,
  },

  title: {
    fontSize: '1.75rem',
    fontWeight: 800,
    marginBottom: '0.3rem',
    letterSpacing: '-0.5px',
    textAlign: 'center',
    color: '#fed81e', // strong yellow accent
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#d1d5db',
    marginBottom: '1.4rem',
    textAlign: 'center',
  },
  brand: {
    color: '#e84610',
    fontWeight: 700,
  },

  // Inputs
  fieldGroup: {
    marginBottom: '1.2rem',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#fed81e',
    marginBottom: '0.35rem',
  },
  input: {
    width: '100%',
    padding: '0.8rem 0.9rem',
    borderRadius: '10px',
    border: '1px solid rgba(254,216,30,0.35)',
    backgroundColor: 'rgba(30,30,45,0.85)',
    color: '#fff',
    fontSize: '0.92rem',
    transition: '0.2s ease',
  },

  helperRow: {
    marginTop: '0.35rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  linkButton: {
    fontSize: '0.75rem',
    color: '#fed81e',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },

  // Premium gradient button with brand colors
  buttonPrimary: {
    width: '100%',
    padding: '0.85rem',
    borderRadius: '999px',
    border: 'none',
    background: `
      linear-gradient(135deg, #e84610, #fed81e, #282c62)
    `,
    backgroundSize: '240% 240%',
    color: '#111',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow:
      '0 12px 28px rgba(232,70,16,0.35), 0 0 18px rgba(254,216,30,0.5)',
    transition: '0.35s ease',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },

  errorMsg: {
    color: '#ff9d9d',
    backgroundColor: 'rgba(120,20,20,0.45)',
    borderRadius: '10px',
    padding: '0.55rem 0.75rem',
    fontSize: '0.8rem',
    marginBottom: '1rem',
    border: '1px solid rgba(200,50,50,0.4)',
  },

  successMsg: {
    color: '#d7ffcf',
    backgroundColor: 'rgba(30,80,30,0.4)',
    borderRadius: '10px',
    padding: '0.55rem 0.75rem',
    fontSize: '0.8rem',
    marginBottom: '1rem',
    border: '1px solid rgba(122,199,122,0.45)',
  },

  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    margin: '1.2rem 0 1rem',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(to right, transparent, #fed81e, transparent)',
  },
  dividerText: {
    fontSize: '0.75rem',
    color: '#fed81e',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  },

  googleWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
};
