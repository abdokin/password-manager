import { Link, useLocation } from 'react-router-dom';
import NotificationBell from '@/components/NotificationBell';

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
          <Link
            to="/team"
            className={`px-4 py-2 rounded ${
              location.pathname === '/team' ? 'text-yellow-400 bg-white/10' : 'text-white'
            } no-underline`}
          >
            Team
          </Link>
          <Link
            to="/analytics"
            className={`px-4 py-2 rounded ${
              location.pathname === '/analytics' ? 'text-yellow-400 bg-white/10' : 'text-white'
            } no-underline`}
          >
            Analytics
          </Link>
          <Link
            to="/settings"
            className={`px-4 py-2 rounded ${
              location.pathname === '/settings' ? 'text-yellow-400 bg-white/10' : 'text-white'
            } no-underline`}
          >
            Settings
          </Link>
          <Link
            to="/feature-flags"
            className={`px-4 py-2 rounded ${
              location.pathname === '/feature-flags' ? 'text-yellow-400 bg-white/10' : 'text-white'
            } no-underline`}
          >
            Feature Flags
          </Link>
          <Link
            to="/admin"
            className={`px-4 py-2 rounded ${
              location.pathname === '/admin' ? 'text-yellow-400 bg-white/10' : 'text-white'
            } no-underline`}
          >
            Admin
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
        </div>
      </div>
    </nav>
  );
}
