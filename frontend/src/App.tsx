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
import Layout from '@/components/Layout';
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
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Navigate to="/dashboard" replace />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/passwords"
        element={
          <ProtectedRoute>
            <Layout>
              <PasswordList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/environments"
        element={
          <ProtectedRoute>
            <Layout>
              <EnvironmentsList organizationId={1} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/environments/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <EnvironmentDetail organizationId={1} environmentId={parseInt(window.location.pathname.split('/').pop() || '1')} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute>
            <Layout>
              <PricingPlans organizationId={1} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <Layout>
              <TeamManagement organizationId={1} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/api-keys"
        element={
          <ProtectedRoute>
            <Layout>
              <ApiKeys organizationId={1} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <Notifications organizationId={1} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <Analytics organizationId={1} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Layout>
              <Invoices organizationId={1} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feature-flags"
        element={
          <ProtectedRoute>
            <Layout>
              <FeatureFlags organizationId={1} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
