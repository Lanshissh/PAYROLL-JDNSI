function requireViteEnv(
  key:
    | "VITE_SUPABASE_URL"
    | "VITE_SUPABASE_ANON_KEY"
) {
  const v = import.meta.env[key];
  if (!v || String(v).trim() === "") {
    throw new Error(`Missing required env var: ${key}`);
  }
  return String(v);
}

export const env = {
  SUPABASE_URL: requireViteEnv("VITE_SUPABASE_URL"),
  SUPABASE_ANON_KEY: requireViteEnv("VITE_SUPABASE_ANON_KEY"),
} as const;