import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
        setError(data.message || "Login failed");
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
      setError("Server error. Try again later.");
    }
  };

  return (
    <>
      <div className="first">
        <h1> super admin login</h1>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            type="email"
            id="username"
            placeholder="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>

      <style jsx>{`
        .first {
          max-width: 400px;
          padding: 30px;
          margin: 100px auto;
          border-radius: 10px;
          background: rgb(179, 44, 44);
        }

        .first h1 {
          color: aquamarine;
          text-align: center;
          margin-bottom: 30px;
        }

        .first label {
          color: black;
          display: block;
          text-align: center;
          margin: 10px 0 5px 0;
        }

        input[type="email"],
        input[type="password"] {
          width: 100%;
          padding: 10px;
          font-size: medium;
          border: none;
          border-bottom: 2px solid black;
        }
        button[type="submit"] {
          width: 50%;
          padding: 10px;
          font-size: medium;
          margin-left: 25%;
          background-color: aquamarine;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
          color: black;
          font-weight: bold;
        }
        button[type="submit"]:hover {
          background-color: #00ffcc;
        }
     
        body {
          background-color: rgb(31, 30, 34);
          font-family: Arial, Helvetica, sans-serif;
        }
      `}</style>
    </>
  );
}
