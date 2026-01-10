import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Organization } from '@/types';

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => api.organizations.list(),
  });
}

export function useOrganization(id: number) {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: () => api.organizations.get(id),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Organization>) => api.organizations.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Organization> }) => api.organizations.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.organizations.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

