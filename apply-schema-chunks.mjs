// apply-schema-chunks.mjs — splits schema into statements and applies via Supabase RPC
// The service_role key bypasses RLS so we can run raw SQL via pg_query if available,
// or via individual REST inserts.
// Usage: SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node apply-schema-chunks.mjs

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Test connection — select from a known table
const { data, error } = await supabase.from('session_requests').select('count').limit(1);
if (error) {
  console.log('session_requests not found (expected on fresh DB):', error.message);
} else {
  console.log('session_requests exists:', data);
}

// Try running SQL via rpc exec_sql if it exists
const { data: d2, error: e2 } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
console.log('exec_sql attempt:', e2?.message ?? JSON.stringify(d2));
