import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Environment } from '@/types/environment';

export function useEnvironments(organizationId: number, type?: string) {
  return useQuery({
    queryKey: ['environments', organizationId, type],
    queryFn: () => api.environments.list(organizationId, type),
    enabled: !!organizationId,
  });
}

export function useEnvironment(organizationId: number, environmentId: number) {
  return useQuery({
    queryKey: ['environments', organizationId, environmentId],
    queryFn: () => api.environments.get(organizationId, environmentId),
    enabled: !!organizationId && !!environmentId,
  });
}

export function useCreateEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organizationId, data }: { organizationId: number; data: Partial<Environment> }) =>
      api.environments.create(organizationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['environments', variables.organizationId] });
    },
  });
}

export function useAddEnvironmentVariable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizationId,
      environmentId,
      key,
      value,
      encrypted,
    }: {
      organizationId: number;
      environmentId: number;
      key: string;
      value: string;
      encrypted?: boolean;
    }) => api.environments.addVariable(organizationId, environmentId, key, value, encrypted),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['environments', variables.organizationId, variables.environmentId],
      });
    },
  });
}

export function useGetEnvironmentVariable() {
  return useMutation({
    mutationFn: ({
      organizationId,
      environmentId,
      key,
    }: {
      organizationId: number;
      environmentId: number;
      key: string;
    }) => api.environments.getVariable(organizationId, environmentId, key),
  });
}

