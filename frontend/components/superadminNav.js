import Link from 'next/link';

export default function SuperAdminNavbar() {
  return (
    <nav style={{ background: '#333', padding: '1rem' }}>
      <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem', margin: 0 }}>
        <li>
          <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/superadmin/addadmin" style={{ color: 'white', textDecoration: 'none' }}>
            Register
          </Link>
        </li>
        <li>
          <Link href="/superadmin/deleteadmin" style={{ color: 'white', textDecoration: 'none' }}>
            Delete Admin
          </Link>
        </li>
      </ul>
    </nav>
  );
}
