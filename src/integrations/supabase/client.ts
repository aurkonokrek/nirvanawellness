import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL : '') ||
  'https://etixzwoqvuolnofnfshm.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY : '') ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0aXh6d29xdnVvbG5vZm5mc2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMzQ4NDksImV4cCI6MjEwMDYxMDg0OX0.1GkappYq5AfGMcYYBdkqKgHr63nDkWWwPVTPOfmkm8Y';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
