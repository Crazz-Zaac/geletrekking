import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      router.replace('/login'); // redirect if not admin
    }
  }, [router]);

  return <h1>Welcome to the Admin Dashboard</h1>;
}
