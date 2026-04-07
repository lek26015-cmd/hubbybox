import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop, receiver) {
    if (!cachedClient) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        // During build time, if keys are missing, returned a proxy that handles it or throws ONLY when called
        // However, most Next.js builds just need the module to be evaluatable.
        if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
            // Return a dummy client or just ignore to allow module evaluation
            console.warn('Supabase keys missing during module evaluation (likely build time)');
            return (prop in target) ? (target as any)[prop] : undefined;
        }
        throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
      }
      cachedClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    return Reflect.get(cachedClient, prop, receiver);
  }
});
