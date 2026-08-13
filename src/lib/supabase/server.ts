import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabasePublicConfig } from './config';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabasePublicConfig.url,
    supabasePublicConfig.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}
