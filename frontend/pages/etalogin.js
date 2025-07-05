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

  return (<>

<div className="loginpage">
  <div className="box">
    <h2>Login</h2>

    <input
      placeholder="Email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      placeholder="Password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    {error && <p className="error">{error}</p>}

    <button onClick={() => handleLogin('superadmin')}>Login as Superadmin</button>
    <button onClick={() => handleLogin('admin')}>Login as Admin</button>
  </div>

  <style jsx>{`
    .loginpage {
      background: linear-gradient(to bottom,rgb(175, 81, 133),rgb(83, 172, 90));
      height: 100vh;
      width: 100vw;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .box {
      background-color: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }

    .box h2 {
      margin-bottom: 30px;
      font-size: 28px;
      color: #333;
    }

    input {
      width: 100%;
      padding: 12px 16px;
      margin-bottom: 20px;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 1rem;
      transition: 0.2s ease;
    }

    input:focus {
      border-color: #4facfe;
      outline: none;
    }

    .error {
      color: red;
      margin-bottom: 20px;
      font-weight: bold;
      text-align: center;
    }

    button {
      width: 100%;
      padding: 12px;
      margin-bottom: 15px;
      background-color:rgb(55, 212, 116);
      border: none;
      border-radius: 6px;
      color: white;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    button:hover {
      background-color: #00c6ff;
    }
  `}</style>
</div>


    </>
  );
}
