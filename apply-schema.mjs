// apply-schema.mjs — applies supabase/schema.sql to the project via Management API
// Usage: SUPABASE_PROJECT_ID=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node apply-schema.mjs
import { readFileSync } from 'fs';

const PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!PROJECT_ID || !SERVICE_ROLE) {
  console.error('Missing required environment variables: SUPABASE_PROJECT_ID, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sql = readFileSync('./supabase/schema.sql', 'utf8');

// Supabase Management API — run SQL on a project
const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE}`,
    },
    body: JSON.stringify({ query: sql }),
  }
);

const text = await res.text();
console.log('Status:', res.status);
console.log('Body:', text.slice(0, 1000));
