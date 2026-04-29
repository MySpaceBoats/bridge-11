const PLACEHOLDER_SUPABASE_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_SUPABASE_PUBLISHABLE_KEY = 'placeholder-publishable-key';

type SupabaseEnv = {
  url: string;
  publishableKey: string;
  isConfigured: boolean;
};

export const getSupabaseEnv = (): SupabaseEnv => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && publishableKey) {
    return {
      url,
      publishableKey,
      isConfigured: true,
    };
  }

  return {
    url: PLACEHOLDER_SUPABASE_URL,
    publishableKey: PLACEHOLDER_SUPABASE_PUBLISHABLE_KEY,
    isConfigured: false,
  };
};
