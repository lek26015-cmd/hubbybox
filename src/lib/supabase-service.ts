import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

/** Server-only: ใช้ service role ลัด RLS สำหรับ LINE webhook ฯลฯ */
export function getServiceSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY จำเป็นสำหรับ LINE webhook');
  }
  cached = createClient(url, key);
  return cached;
}
