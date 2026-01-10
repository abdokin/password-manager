import axios from 'axios';
import type { Password, Organization, Category, Tag } from '@/types';
import type { Environment, EnvironmentVariable } from '@/types/environment';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  passwords: {
    list: () => apiClient.get<Password[]>('/passwords').then(res => res.data),
    get: (id: number) => apiClient.get<Password>(`/passwords/${id}`).then(res => res.data),
    create: (data: Partial<Password>) => apiClient.post<Password>('/passwords', { password: data }).then(res => res.data),
    update: (id: number, data: Partial<Password>) => apiClient.put<Password>(`/passwords/${id}`, { password: data }).then(res => res.data),
    delete: (id: number) => apiClient.delete(`/passwords/${id}`).then(() => undefined),
    toggleFavorite: (id: number) => apiClient.post<Password>(`/passwords/${id}/toggle_favorite`).then(res => res.data),
    history: (id: number) => apiClient.get<any[]>(`/passwords/${id}/history`).then(res => res.data),
  },
  organizations: {
    list: () => apiClient.get<Organization[]>('/organizations').then(res => res.data),
    get: (id: number) => apiClient.get<Organization>(`/organizations/${id}`).then(res => res.data),
    create: (data: Partial<Organization>) => apiClient.post<Organization>('/organizations', { organization: data }).then(res => res.data),
    update: (id: number, data: Partial<Organization>) => apiClient.put<Organization>(`/organizations/${id}`, { organization: data }).then(res => res.data),
    delete: (id: number) => apiClient.delete(`/organizations/${id}`).then(() => undefined),
  },
  categories: {
    list: (organizationId: number) => apiClient.get<Category[]>(`/organizations/${organizationId}/categories`).then(res => res.data),
    create: (organizationId: number, data: Partial<Category>) => apiClient.post<Category>(`/organizations/${organizationId}/categories`, { category: data }).then(res => res.data),
  },
  tags: {
    list: (organizationId: number) => apiClient.get<Tag[]>(`/organizations/${organizationId}/tags`).then(res => res.data),
    create: (organizationId: number, data: Partial<Tag>) => apiClient.post<Tag>(`/organizations/${organizationId}/tags`, { tag: data }).then(res => res.data),
  },
  auth: {
    magicLink: (email: string) => apiClient.post<{ message: string; token: string }>('/auth/magic_link', { email }).then(res => res.data),
    verify: (token: string) => apiClient.post<{ token: string; user: User }>('/auth/verify', { token }).then(res => res.data),
    login: (email: string, password: string) => apiClient.post<{ token: string; user: User }>('/auth/login', { email, password }).then(res => res.data),
    me: () => apiClient.get<{ user: User }>('/auth/me').then(res => res.data),
  },
  passwordGenerator: {
    generate: (options: { length?: number; include_uppercase?: boolean; include_lowercase?: boolean; include_numbers?: boolean; include_symbols?: boolean }) =>
      apiClient.post<{ password: string; length: number }>('/password_generator', options).then(res => res.data),
  },
  health: {
    check: () => apiClient.get<{ status: string; timestamp: string }>('/health').then(res => res.data),
  },
  environments: {
    list: (organizationId: number, type?: string) => {
      const url = type ? `/organizations/${organizationId}/environments?type=${type}` : `/organizations/${organizationId}/environments`;
      return apiClient.get<Environment[]>(url).then(res => res.data);
    },
    get: (organizationId: number, environmentId: number) =>
      apiClient.get<Environment>(`/organizations/${organizationId}/environments/${environmentId}`).then(res => res.data),
    create: (organizationId: number, data: Partial<Environment>) =>
      apiClient.post<Environment>(`/organizations/${organizationId}/environments`, { environment: data }).then(res => res.data),
    update: (organizationId: number, environmentId: number, data: Partial<Environment>) =>
      apiClient.put<Environment>(`/organizations/${organizationId}/environments/${environmentId}`, { environment: data }).then(res => res.data),
    delete: (organizationId: number, environmentId: number) =>
      apiClient.delete(`/organizations/${organizationId}/environments/${environmentId}`).then(() => undefined),
    getVariables: (organizationId: number, environmentId: number) =>
      apiClient.get<EnvironmentVariable[]>(`/organizations/${organizationId}/environments/${environmentId}/variables`).then(res => res.data),
    addVariable: (organizationId: number, environmentId: number, key: string, value: string, encrypted?: boolean) =>
      apiClient.post<EnvironmentVariable>(`/organizations/${organizationId}/environments/${environmentId}/variables`, { key, value, encrypted }).then(res => res.data),
    getVariable: (organizationId: number, environmentId: number, key: string) =>
      apiClient.get<{ key: string; value: string }>(`/organizations/${organizationId}/environments/${environmentId}/variables/${key}`).then(res => res.data),
    updateVariable: (organizationId: number, environmentId: number, key: string, value: string, encrypted?: boolean) =>
      apiClient.put<EnvironmentVariable>(`/organizations/${organizationId}/environments/${environmentId}/variables/${key}`, { value, encrypted }).then(res => res.data),
    deleteVariable: (organizationId: number, environmentId: number, key: string) =>
      apiClient.delete(`/organizations/${organizationId}/environments/${environmentId}/variables/${key}`).then(() => undefined),
    getAccesses: (organizationId: number, environmentId: number) =>
      apiClient.get<any[]>(`/organizations/${organizationId}/environments/${environmentId}/accesses`).then(res => res.data),
    grantAccess: (organizationId: number, environmentId: number, email: string, role: string) =>
      apiClient.post<any>(`/organizations/${organizationId}/environments/${environmentId}/accesses`, { email, role }).then(res => res.data),
    revokeAccess: (organizationId: number, environmentId: number, email: string) =>
      apiClient.delete(`/organizations/${organizationId}/environments/${environmentId}/accesses`, { data: { email } }).then(() => undefined),
  },
  payments: {
    getPlans: (organizationId: number) =>
      apiClient.get<{ plans: any[] }>(`/organizations/${organizationId}/payments/plans`).then(res => res.data),
    createCheckout: (organizationId: number, planId: string) =>
      apiClient.post<{ checkout_url: string; session_id: string }>(`/organizations/${organizationId}/payments/checkout`, {
        plan_id: planId,
      }).then(res => res.data),
    getSubscription: (organizationId: number) =>
      apiClient.get<any>(`/organizations/${organizationId}/payments/subscription`).then(res => res.data),
    cancelSubscription: (organizationId: number) =>
      apiClient.post<{ message: string }>(`/organizations/${organizationId}/payments/cancel`).then(res => res.data),
  },
  teamMembers: {
    list: (organizationId: number) =>
      apiClient.get<any[]>(`/organizations/${organizationId}/team_members`).then(res => res.data),
    create: (organizationId: number, data: { email: string; role: string }) =>
      apiClient.post<any>(`/organizations/${organizationId}/team_members`, data).then(res => res.data),
    update: (organizationId: number, id: number, role: string) =>
      apiClient.put<any>(`/organizations/${organizationId}/team_members/${id}`, { role }).then(res => res.data),
    delete: (organizationId: number, id: number) =>
      apiClient.delete(`/organizations/${organizationId}/team_members/${id}`).then(() => undefined),
  },
  apiKeys: {
    list: (organizationId?: number) => {
      const url = organizationId ? `/api_keys?organization_id=${organizationId}` : '/api_keys';
      return apiClient.get<any[]>(url).then(res => res.data);
    },
    create: (data: { name: string; organization_id?: number }) =>
      apiClient.post<any>('/api_keys', data).then(res => res.data),
    revoke: (key: string) =>
      apiClient.post<{ message: string }>(`/api_keys/${key}/revoke`).then(res => res.data),
  },
  notifications: {
    list: (organizationId?: number, unread?: boolean) => {
      const params = new URLSearchParams();
      if (organizationId) params.append('organization_id', organizationId.toString());
      if (unread) params.append('unread', 'true');
      return apiClient.get<any[]>(`/notifications?${params}`).then(res => res.data);
    },
    markAsRead: (id: number) =>
      apiClient.post<{ message: string }>(`/notifications/${id}/read`).then(res => res.data),
    markAllAsRead: () =>
      apiClient.post<{ message: string }>('/notifications/read_all').then(res => res.data),
  },
  invoices: {
    list: (organizationId: number) =>
      apiClient.get<any[]>(`/organizations/${organizationId}/invoices`).then(res => res.data),
    get: (organizationId: number, id: number) =>
      apiClient.get<any>(`/organizations/${organizationId}/invoices/${id}`).then(res => res.data),
    download: (organizationId: number, id: number) =>
      apiClient.get<any>(`/organizations/${organizationId}/invoices/${id}/download`).then(res => res.data),
  },
  analytics: {
    getUsage: (organizationId: number, startDate?: string, endDate?: string) => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      return apiClient.get<any>(`/organizations/${organizationId}/analytics/usage?${params}`).then(res => res.data);
    },
  },
  featureFlags: {
    list: (organizationId?: number) => {
      const url = organizationId ? `/feature_flags?organization_id=${organizationId}` : '/feature_flags';
      return apiClient.get<any[]>(url).then(res => res.data);
    },
    get: (key: string) => apiClient.get<any>(`/feature_flags/${key}`).then(res => res.data),
    create: (data: { key: string; name: string; description?: string; category?: string; status?: string }) =>
      apiClient.post<any>('/feature_flags', data).then(res => res.data),
    update: (key: string, data: { name?: string; description?: string; category?: string; status?: string }) =>
      apiClient.put<any>(`/feature_flags/${key}`, data).then(res => res.data),
    toggle: (key: string, status: string) =>
      apiClient.post<any>(`/feature_flags/${key}/toggle`, { status }).then(res => res.data),
    setOverride: (key: string, data: { user_id?: number; organization_id?: number; enabled: boolean }) =>
      apiClient.post<any>(`/feature_flags/${key}/override`, data).then(res => res.data),
    removeOverride: (key: string, data: { user_id?: number; organization_id?: number }) =>
      apiClient.delete(`/feature_flags/${key}/override`, { data }).then(() => undefined),
  },
  userSettings: {
    list: () => apiClient.get<any>('/user_settings').then(res => res.data),
    get: (key: string) => apiClient.get<any>(`/user_settings/${key}`).then(res => res.data),
    create: (key: string, value: string) => apiClient.post<any>('/user_settings', { key, value }).then(res => res.data),
    update: (key: string, value: string) => apiClient.put<any>(`/user_settings/${key}`, { value }).then(res => res.data),
  },
  admin: {
    getStats: () => apiClient.get<any>('/admin/dashboard/stats').then(res => res.data),
    getActivityLogs: (params?: { search?: string; organization_id?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.organization_id) queryParams.append('organization_id', params.organization_id.toString());
      return apiClient.get<any[]>(`/admin/dashboard/activity_logs?${queryParams}`).then(res => res.data);
    },
    users: {
      list: (params?: { search?: string; role?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.role) queryParams.append('role', params.role);
        return apiClient.get<any>(`/admin/users?${queryParams}`).then(res => res.data);
      },
      get: (id: number) => apiClient.get<any>(`/admin/users/${id}`).then(res => res.data),
      update: (id: number, data: { name?: string; email?: string; role?: string }) =>
        apiClient.put<any>(`/admin/users/${id}`, data).then(res => res.data),
      delete: (id: number) => apiClient.delete(`/admin/users/${id}`).then(() => undefined),
      toggleRole: (id: number) => apiClient.post<any>(`/admin/users/${id}/toggle_role`).then(res => res.data),
    },
    organizations: {
      list: (params?: { search?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        return apiClient.get<any>(`/admin/organizations?${queryParams}`).then(res => res.data);
      },
      get: (id: number) => apiClient.get<any>(`/admin/organizations/${id}`).then(res => res.data),
      update: (id: number, data: { name?: string; payment_provider?: string }) =>
        apiClient.put<any>(`/admin/organizations/${id}`, data).then(res => res.data),
      delete: (id: number) => apiClient.delete(`/admin/organizations/${id}`).then(() => undefined),
    },
  },
};

