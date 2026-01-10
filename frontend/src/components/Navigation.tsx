import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  User, 
  LayoutDashboard, 
  Lock, 
  Server, 
  CreditCard, 
  Users, 
  BarChart3, 
  Settings, 
  Flag,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/passwords', label: 'Passwords', icon: Lock },
    { path: '/environments', label: 'Environments', icon: Server },
    { path: '/team', label: 'Team', icon: Users },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/pricing', label: 'Pricing', icon: CreditCard },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/feature-flags', label: 'Feature Flags', icon: Flag },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: Shield });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Link to="/dashboard" className="mr-6 flex items-center space-x-2">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Lock className="size-4" />
          </div>
          <span className="font-bold text-lg">Password Manager</span>
        </Link>
        
        <nav className="flex items-center gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && item.path !== '/' && location.pathname.startsWith(item.path)) ||
              (item.path === '/' && location.pathname === '/passwords');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline-block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <NotificationBell />
          {user && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 text-sm">
                <User className="size-4 text-muted-foreground" />
                <span className="hidden md:inline-block text-muted-foreground">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-2"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline-block">Logout</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
