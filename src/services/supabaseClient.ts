/**
 * Supabase Client Initialization
 * 
 * Za povezivanje sa stvarnom Supabase bazom podataka, dodajte u vaš .env ili .env.local:
 * VITE_SUPABASE_URL=https://vas-projekat.supabase.co
 * VITE_SUPABASE_ANON_KEY=vas-anon-javni-kljuc
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
