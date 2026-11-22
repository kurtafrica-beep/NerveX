// The Supabase project that holds Nerve's accounts, lines and recordings.
// The publishable key is safe to ship inside the app: every table and the
// recordings bucket are locked down by row-level security on the server.
export const SUPABASE_URL = 'https://ddvsifbydoukfwohkqod.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_mfF7Z4S1oQtF5FGwocKKVw_EsboT8Rc';

export const BUCKET = 'recordings';
export const MAX_AUDIO_SECONDS = 30 * 60;
export const MAX_VIDEO_SECONDS = 90;
