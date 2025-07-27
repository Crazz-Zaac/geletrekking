import { useState } from 'react';
import { useRouter } from 'next/router';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

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

    try {
      const res = await fetch('http://localhost:5000/api/superadmin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      if (data?.token && data?.user?.role) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        handleRoutingByRole(data.user.role);
      } else {
        setError('Login succeeded, but user data is missing.');
      }
    } catch (err) {
      setError('Server error. Try again later.');
    }
  };

  const handleGoogleSuccess = async (response) => {
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

      if (resData?.token && resData?.user?.role) {
        localStorage.setItem('token', resData.token);
        localStorage.setItem('role', resData.user.role);
        handleRoutingByRole(resData.user.role);
      } else {
        setError('Google login succeeded, but user data is missing.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <h2 className="title">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button className="button" onClick={() => handleLogin('admin')}>
          Login as Admin
        </button>

        <div className="divider">or</div>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google login failed')}
          width="100%"
        />
      </div>

      <style jsx>{`
        .container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          min-height: 100vh;
          background: linear-gradient(to right, #ece9e6, #ffffff);
        }

        .login-box {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }

        .title {
          text-align: center;
          margin-bottom: 1.5rem;
          font-size: 2rem;
          color: #333;
        }

        .input {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .input:focus {
          border-color: #0070f3;
          outline: none;
        }

        .button {
          width: 100%;
          padding: 0.75rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .button:hover {
          background-color: #005ac1;
        }

        .error {
          color: #e00;
          margin-bottom: 1rem;
          text-align: center;
          font-size: 0.95rem;
        }

        .divider {
          text-align: center;
          margin: 1rem 0;
          color: #888;
          font-size: 0.9rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .login-box {
            padding: 1.5rem;
          }

          .title {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 480px) {
          .login-box {
            padding: 1rem;
          }

          .title {
            font-size: 1.5rem;
          }

          .input {
            padding: 0.30rem;
            font-size: 0.95rem;
          }

          .button {
            padding: 0.65rem;
            font-size: 0.95rem;
          
          }
        }
      `}</style>
    </div>
  );
}
