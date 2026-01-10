import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-gray-800 px-8 py-4 mb-8">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-white font-bold text-xl no-underline">
          Password Manager
        </Link>
        <div className="flex gap-4 ml-auto">
          <Link
            to="/"
            className={`px-4 py-2 rounded ${
              location.pathname === '/' ? 'text-yellow-400 bg-white/10' : 'text-white'
            } no-underline`}
          >
            Passwords
          </Link>
          <Link
            to="/dashboard"
            className={`px-4 py-2 rounded ${
              location.pathname === '/dashboard' ? 'text-yellow-400 bg-white/10' : 'text-white'
            } no-underline`}
          >
            Dashboard
          </Link>
          <Link
            to="/environments"
            className={`px-4 py-2 rounded ${
              location.pathname.startsWith('/environments') ? 'text-yellow-400 bg-white/10' : 'text-white'
            } no-underline`}
          >
            Environments
          </Link>
          <Link
            to="/pricing"
            className={`px-4 py-2 rounded ${
              location.pathname === '/pricing' ? 'text-yellow-400 bg-white/10' : 'text-white'
            } no-underline`}
          >
            Pricing
          </Link>
        </div>
      </div>
    </nav>
  );
}
