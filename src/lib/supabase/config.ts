/**
 * Supabase config, split by trust boundary — was one object with all three
 * fields together, imported into client.ts (a browser-side file) alongside
 * server.ts/storage.ts/email.ts. SUPABASE_SERVICE_ROLE_KEY is a secret with
 * no NEXT_PUBLIC_ prefix; it has no business being importable from browser
 * code even if the bundler happens to strip it to `undefined` today.
 *
 * Import `supabasePublicConfig` from client-reachable code.
 * Import `supabaseServiceConfig` only from server-only files.
 */
export const supabasePublicConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
};

export const supabaseServiceConfig = {
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
};
