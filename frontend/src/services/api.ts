import axios from 'axios';
import type { Password, Organization, Category, Tag } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    verify: (token: string) => apiClient.post<{ user_id: number; email: string }>('/auth/verify', { token }).then(res => res.data),
  },
  passwordGenerator: {
    generate: (options: { length?: number; include_uppercase?: boolean; include_lowercase?: boolean; include_numbers?: boolean; include_symbols?: boolean }) =>
      apiClient.post<{ password: string; length: number }>('/password_generator', options).then(res => res.data),
  },
  health: {
    check: () => apiClient.get<{ status: string; timestamp: string }>('/health').then(res => res.data),
  },
};
