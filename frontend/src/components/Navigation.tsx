import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  return (
    <nav
      style={{
        backgroundColor: '#343a40',
        padding: '1rem 2rem',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link
          to="/"
          style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.2rem',
          }}
        >
          Password Manager
        </Link>
        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
          <Link
            to="/"
            style={{
              color: location.pathname === '/' ? '#ffc107' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            Passwords
          </Link>
          <Link
            to="/dashboard"
            style={{
              color: location.pathname === '/dashboard' ? '#ffc107' : 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              backgroundColor: location.pathname === '/dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}

