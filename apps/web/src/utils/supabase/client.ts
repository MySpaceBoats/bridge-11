import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

export const createClient = () => {
  const { url, publishableKey } = getSupabaseEnv();

  return createBrowserClient(url, publishableKey);
};
