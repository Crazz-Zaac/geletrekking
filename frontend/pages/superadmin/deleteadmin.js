import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/superadminNav';

export default function DeleteAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'superadmin') {
      router.replace('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return <p>Loading...</p>;

  const validateEmail = (email) => {
    // Basic email regex validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleDelete = async () => {
    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('Please enter admin email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/superadmin/deleteadmin/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete admin');
      }

      setMessage('✅ Admin deleted successfully!');
      setEmail('');
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 400, margin: 'auto', paddingTop: 50 }}>
        <h1>Delete Admin</h1>

        <input
          type="email"
          placeholder="Admin Email to delete"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', marginBottom: 10, width: '100%' }}
          required
        />

        <button onClick={handleDelete} style={{ width: '100%' }}>
          Delete Admin
        </button>

        {message && <p style={{ color: 'green', marginTop: 10 }}>{message}</p>}
        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
      </div>
    </>
  );
}
