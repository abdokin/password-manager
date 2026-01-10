import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  category?: string;
  metadata?: Record<string, any>;
}

export function useFeatureFlags(organizationId?: number) {
  const { data: flags = [], isLoading } = useQuery<FeatureFlag[]>({
    queryKey: ['feature_flags', organizationId],
    queryFn: () => api.featureFlags.list(organizationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isEnabled = (key: string): boolean => {
    const flag = flags.find((f) => f.key === key);
    return flag?.enabled ?? false;
  };

  return {
    flags,
    isLoading,
    isEnabled,
  };
}

