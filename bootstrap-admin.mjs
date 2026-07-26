// bootstrap-admin.mjs — bootstraps the admin user in Supabase
// Usage: SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node bootstrap-admin.mjs [email] [password]

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('Example: SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... node bootstrap-admin.mjs');
  process.exit(1);
}

const email = process.argv[2] || 'sumaia@gmail.com';
const password = process.argv[3] || 'Sumaia@123';

console.log(`Setting up admin user: ${email}...`);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Create or update auth user
let userId;
const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error('Error listing users:', listError.message);
  process.exit(1);
}

const existing = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

if (existing) {
  console.log(`User ${email} found with ID: ${existing.id}`);
  userId = existing.id;
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password,
    user_metadata: { display_name: 'Sumaia', reset_required: false },
    email_confirm: true,
  });
  if (updateError) {
    console.error('Error updating user password/metadata:', updateError.message);
    process.exit(1);
  }
  console.log('Password & metadata successfully updated.');
} else {
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { display_name: 'Sumaia', reset_required: false },
    email_confirm: true,
  });
  if (createError) {
    console.error('Error creating user:', createError.message);
    process.exit(1);
  }
  userId = createData.user.id;
  console.log(`Created new auth user with ID: ${userId}`);
}

// 2. Assign admin role in user_roles table
const { error: roleError } = await supabase
  .from('user_roles')
  .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' });

if (roleError) {
  console.error('Error assigning admin role in user_roles table:', roleError.message);
  console.log('Note: Run supabase/schema.sql in the Supabase SQL Editor if tables are not yet created.');
} else {
  console.log(`Successfully assigned 'admin' role to ${email}!`);
  console.log(`Email: ${email}`);
}
