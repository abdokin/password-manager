export interface Password {
  id: number;
  name: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  favorite: boolean;
  expires_at?: string;
  strength_score: number;
  is_breached: boolean;
  is_duplicate: boolean;
  is_weak: boolean;
  user_id: number;
  organization_id: number;
  category_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  organization_id: number;
}

export interface Tag {
  id: number;
  name: string;
  organization_id: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

