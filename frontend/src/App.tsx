import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PasswordList from '@/components/PasswordList';
import Dashboard from '@/components/Dashboard';
import EnvironmentsList from '@/components/EnvironmentsList';
import EnvironmentDetail from '@/components/EnvironmentDetail';
import Navigation from '@/components/Navigation';
import ErrorBoundary from '@/components/ErrorBoundary';
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
        <Navigation />
        <Routes>
          <Route path="/" element={<PasswordList />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/environments" element={<EnvironmentsList organizationId={1} />} />
          <Route path="/environments/:id" element={<EnvironmentDetail organizationId={1} environmentId={parseInt(window.location.pathname.split('/').pop() || '1')} />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
