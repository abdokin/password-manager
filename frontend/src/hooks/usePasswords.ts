import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Password } from '@/types';

export function usePasswords() {
  return useQuery({
    queryKey: ['passwords'],
    queryFn: () => api.passwords.list(),
  });
}

export function usePassword(id: number) {
  return useQuery({
    queryKey: ['passwords', id],
    queryFn: () => api.passwords.get(id),
    enabled: !!id,
  });
}

export function useCreatePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Password>) => api.passwords.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
    },
  });
}

export function useUpdatePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Password> }) => api.passwords.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
      queryClient.invalidateQueries({ queryKey: ['passwords', variables.id] });
    },
  });
}

export function useDeletePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.passwords.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.passwords.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
    },
  });
}

