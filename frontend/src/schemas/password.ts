import { z } from 'zod';

export const passwordSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().optional(),
  favorite: z.boolean().default(false),
  expires_at: z.string().optional(),
  user_id: z.number().default(1),
  organization_id: z.number().default(1),
  category_id: z.number().optional(),
});

export type PasswordFormData = z.infer<typeof passwordSchema>;

