import { createClient } from '@supabase/supabase-js';
import type { Env } from '../types';

/** Service-role client — bypasses RLS, use for server-side mutations */
export function adminClient(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

/** Verify a user JWT and return the user, or null */
export async function verifyToken(env: Env, token: string) {
  const sb = adminClient(env);
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
