function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const config = {
  PORT: Number(process.env.PORT ?? 3001),

  // adjust names if your env keys differ
  SUPABASE_URL: requireEnv('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  DOCUMENTS_BUCKET: process.env.DOCUMENTS_BUCKET ?? 'documents'
} as const;