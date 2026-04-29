export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY: string;
  CORS_ORIGIN: string;
  ENVIRONMENT: string;
}

export type Variables = {
  userId: string;
};
