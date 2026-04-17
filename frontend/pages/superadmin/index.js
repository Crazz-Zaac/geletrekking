import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SuperadminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'superadmin') {
      router.replace('/login'); // redirect if not superadmin
    }
  }, [router]);

  return <h1>Welcome to the Superadmin Dashboard</h1>;
}
