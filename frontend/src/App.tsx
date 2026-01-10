import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PasswordList from '@/components/PasswordList';
import '@/index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PasswordList />
    </QueryClientProvider>
  );
}

export default App;
