import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useAudit(organizationId: number) {
  return useQuery({
    queryKey: ['audit', organizationId],
    queryFn: () => fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1'}/organizations/${organizationId}/audit`).then(res => res.json()),
    enabled: !!organizationId,
  });
}

