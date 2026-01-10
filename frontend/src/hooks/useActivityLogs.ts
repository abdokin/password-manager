import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useActivityLogs(organizationId?: number, userId?: number) {
  return useQuery({
    queryKey: ['activity_logs', organizationId, userId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (organizationId) params.append('organization_id', organizationId.toString());
      if (userId) params.append('user_id', userId.toString());
      return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/activity_logs?${params}`).then(res => res.json());
    },
  });
}

