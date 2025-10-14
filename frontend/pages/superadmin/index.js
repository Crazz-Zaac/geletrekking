import { useEffect } from 'react';
import { useRouter } from 'next/router';
// import Navbar from '../../components/Navbar';

export default function SuperadminIndex() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'superadmin') {
      router.replace('/login');
    }
  }, [router]);

  return (
    <>
      {/* <Navbar /> */}
      <div style={{ maxWidth: 600, margin: 'auto', padding: '2rem' }}>
        <h1>Welcome, Superadmin!</h1>
        <p>Use the "Registration" link above to add new admins.</p>
      </div>
    </>
  );
}
