import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  magicLink: (email: string) => Promise<void>;
  verify: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await api.auth.me();
        return response.user || response;
      } catch (error) {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        throw error;
      }
    },
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (userData) {
      setUser(userData as User);
    }
  }, [userData]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await api.auth.login(email, password);
      return response;
    },
    onSuccess: (data) => {
      const token = data.token || (data as any).data?.token;
      const user = data.user || (data as any).data?.user;
      if (token && user) {
        setToken(token);
        setUser(user);
        localStorage.setItem('auth_token', token);
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
  });

  const magicLinkMutation = useMutation({
    mutationFn: async (email: string) => {
      return await api.auth.magicLink(email);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await api.auth.verify(token);
      return response;
    },
    onSuccess: (data) => {
      const token = data.token || (data as any).data?.token;
      const user = data.user || (data as any).data?.user;
      if (token && user) {
        setToken(token);
        setUser(user);
        localStorage.setItem('auth_token', token);
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const magicLink = async (email: string) => {
    await magicLinkMutation.mutateAsync(email);
  };

  const verify = async (token: string) => {
    await verifyMutation.mutateAsync(token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    queryClient.clear();
  };

  const refreshUser = async () => {
    if (token) {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading: isLoading || loginMutation.isPending || verifyMutation.isPending,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    login,
    magicLink,
    verify,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
