import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * 客戶端 Supabase 實例
 * 用於瀏覽器端操作
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
