// utils/supabaseAdmin.js
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing. Check .env.local');
}
if (!serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing. Add it in .env.local (server-only).');
}

// (opsional) runtime guard: kalau sampai ter-import di client, fail cepat
if (typeof window !== 'undefined') {
  throw new Error('Do not import supabaseAdmin on the client.');
}

// Singleton agar tidak membuat banyak koneksi saat HMR
let _client;
export function getSupabaseAdmin() {
  if (!_client) {
    _client = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
  return _client;
}

const supabaseAdmin = getSupabaseAdmin();
export default supabaseAdmin;
