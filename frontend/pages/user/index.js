import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function UserDashboard() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'user') {
      router.replace('/login'); // redirect if not user
    }
  }, [router]);

  return <h1>Welcome to the User Dashboard</h1>;
}
