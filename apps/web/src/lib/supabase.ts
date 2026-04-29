import { createClient } from '@/utils/supabase/client';

// Singleton browser client — use this in client components and stores
export const supabase = createClient();
