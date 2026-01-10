import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import PasswordList from '@/components/PasswordList';
import Dashboard from '@/components/Dashboard';
import EnvironmentsList from '@/components/EnvironmentsList';
import EnvironmentDetail from '@/components/EnvironmentDetail';
import PricingPlans from '@/components/PricingPlans';
import TeamManagement from '@/components/TeamManagement';
import ApiKeys from '@/components/ApiKeys';
import Notifications from '@/components/Notifications';
import Analytics from '@/components/Analytics';
import Invoices from '@/components/Invoices';
import Settings from '@/components/Settings';
import FeatureFlags from '@/components/FeatureFlags';
import AdminDashboard from '@/components/AdminDashboard';
import Navigation from '@/components/Navigation';
import Login from '@/components/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import '@/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PasswordList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/environments"
        element={
          <ProtectedRoute>
            <EnvironmentsList organizationId={1} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/environments/:id"
        element={
          <ProtectedRoute>
            <EnvironmentDetail organizationId={1} environmentId={parseInt(window.location.pathname.split('/').pop() || '1')} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute>
            <PricingPlans organizationId={1} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <TeamManagement organizationId={1} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/api-keys"
        element={
          <ProtectedRoute>
            <ApiKeys organizationId={1} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications organizationId={1} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics organizationId={1} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Invoices organizationId={1} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feature-flags"
        element={
          <ProtectedRoute>
            <FeatureFlags organizationId={1} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navigation />
            <AppRoutes />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
