import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Resolved by Vite at build time for the browser bundle, and from the
// process environment during SSR.
//
// There is deliberately NO hardcoded fallback here. An earlier version
// defaulted to a second, unrelated Supabase project when these vars were
// absent. That failed silently in the worst possible way: auth requests
// went to a database where the admin user did not exist, so a correct
// password came back as "Invalid login credentials" with nothing in the
// logs to explain it. Failing loudly at startup is the cheaper bug.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof process !== "undefined"
    ? process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    : undefined);

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (typeof process !== "undefined"
    ? process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY
    : undefined);

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const missing = [
    ...(!SUPABASE_URL ? ["VITE_SUPABASE_URL"] : []),
    ...(!SUPABASE_PUBLISHABLE_KEY ? ["VITE_SUPABASE_PUBLISHABLE_KEY"] : []),
  ].join(", ");
  throw new Error(
    `[Supabase] Missing environment variable(s): ${missing}. ` +
      "Set them in .env for local dev and in the hosting provider environment for deploys.",
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
