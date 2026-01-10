import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';

interface GeneratorOptions {
  length?: number;
  include_uppercase?: boolean;
  include_lowercase?: boolean;
  include_numbers?: boolean;
  include_symbols?: boolean;
}

export function usePasswordGenerator() {
  return useMutation({
    mutationFn: (options: GeneratorOptions) => api.passwordGenerator.generate(options),
  });
}

