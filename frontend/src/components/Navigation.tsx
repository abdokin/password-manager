import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

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
          {isAdmin && (
            <Link
              to="/admin"
              className={`px-4 py-2 rounded ${
                location.pathname === '/admin' ? 'text-yellow-400 bg-white/10' : 'text-white'
              } no-underline`}
            >
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <>
              <div className="flex items-center gap-2 text-white">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          )}
          <NotificationBell />
        </div>
      </div>
    </nav>
  );
}
