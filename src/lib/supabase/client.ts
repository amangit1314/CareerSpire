import { createBrowserClient } from '@supabase/ssr';
import { supabasePublicConfig } from './config';

export function createClient() {
  return createBrowserClient(supabasePublicConfig.url, supabasePublicConfig.anonKey);
}
