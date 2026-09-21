// ── Backend connection ───────────────────────────────────────────────────
// Fill these two values in to switch the leaderboard from local-only to
// global. Everything else in the app already handles both cases.
//
// The anon key is *designed* to be public -- it ships in the browser bundle of
// every Supabase app -- so committing it is fine. What protects the data is
// row-level security on the table, not secrecy of this key. See README.
export const SUPABASE_URL = ''
export const SUPABASE_ANON_KEY = ''

export const isOnline = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
