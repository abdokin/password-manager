import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import '@/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            <Route path="/" element={<PasswordList />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/environments" element={<EnvironmentsList organizationId={1} />} />
            <Route path="/environments/:id" element={<EnvironmentDetail organizationId={1} environmentId={parseInt(window.location.pathname.split('/').pop() || '1')} />} />
            <Route path="/pricing" element={<PricingPlans organizationId={1} />} />
            <Route path="/team" element={<TeamManagement organizationId={1} />} />
            <Route path="/api-keys" element={<ApiKeys organizationId={1} />} />
            <Route path="/notifications" element={<Notifications organizationId={1} />} />
            <Route path="/analytics" element={<Analytics organizationId={1} />} />
            <Route path="/invoices" element={<Invoices organizationId={1} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/feature-flags" element={<FeatureFlags organizationId={1} />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
