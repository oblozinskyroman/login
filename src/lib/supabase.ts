import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  name?: string;
  city?: string;
  phone?: string;
  avatar_url?: string;
  email_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  is_provider: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  services: string[];
  location?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  average_rating?: number;
  review_count?: number;
}

export interface Inquiry {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  service_type?: string;
  location?: string;
  budget?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}