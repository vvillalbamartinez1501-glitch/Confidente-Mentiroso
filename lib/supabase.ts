import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (typeof window !== 'undefined') {
    console.warn('⚠️ Supabase URL or Anon Key is missing in environment variables. Realtime features will use in-memory state.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const ROOMS_TABLE = 'rooms';
export const PLAYERS_TABLE = 'players';
