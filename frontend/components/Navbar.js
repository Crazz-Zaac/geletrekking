import Link from 'next/link';

export default function Navbar() {
  return (
    <nav
      style={{
        padding: '1rem',
        backgroundColor: '#222',
        color: 'white',
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '1rem',
      }}
    >
      <Link
        href="/superadmin/addadmin"
        style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}
      >
        Registration
      </Link>
    </nav>
  );
}
