export interface Environment {
  id: number;
  name: string;
  environment_type: 'development' | 'staging' | 'production' | 'test';
  description?: string;
  organization_id: number;
  created_at: string;
  updated_at: string;
  environment_variables?: EnvironmentVariable[];
  environment_accesses?: EnvironmentAccess[];
}

export interface EnvironmentVariable {
  id: number;
  key: string;
  value: string;
  encrypted: boolean;
  description?: string;
  environment_id: number;
}

export interface EnvironmentAccess {
  id: number;
  role: 'viewer' | 'editor' | 'admin';
  user_id: number;
  environment_id: number;
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

