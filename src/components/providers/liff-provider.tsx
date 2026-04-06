'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import liff from '@line/liff';
import { supabase } from '@/lib/supabase';

interface LiffContextType {
  liff: typeof liff | null;
  error: Error | null;
  userProfile: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  } | null;
  dbUser: {
    id: string;
    box_quota: number;
  } | null;
  isLoading: boolean;
  refreshDbUser: () => Promise<void>;
  skipLoading: () => void;
}

const LiffContext = createContext<LiffContextType>({
  liff: null,
  error: null,
  userProfile: null,
  dbUser: null,
  isLoading: true,
  refreshDbUser: async () => {},
  skipLoading: () => {},
});

export const LiffProvider = ({ 
  children, 
  initialIsLoading = true 
}: { 
  children: ReactNode;
  initialIsLoading?: boolean;
}) => {
  const [liffObject, setLiffObject] = useState<typeof liff | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(initialIsLoading);
  const [userProfile, setUserProfile] = useState<LiffContextType['userProfile']>(null);
  const [dbUser, setDbUser] = useState<LiffContextType['dbUser']>(null);

  const fetchOrSyncDbUser = async (lineUserId: string) => {
    console.log(`[DB] Syncing user: ${lineUserId}`);
    try {
      // 2-second timeout for DB sync to prevent hanging the UI
      const dbPromise = (async () => {
        // 1. Check if user exists
        let { data, error: fetchError } = await supabase
          .from('users')
          .select('id, box_quota')
          .eq('line_user_id', lineUserId)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          console.log('[DB] User not found, creating new...');
          // 2. User not found, create new user
          const { data: newData, error: insertError } = await supabase
            .from('users')
            .insert({ line_user_id: lineUserId })
            .select('id, box_quota')
            .single();
            
          if (insertError) throw insertError;
          data = newData;
        } else if (fetchError) {
          throw fetchError;
        }
        return data;
      })();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 2500)
      );

      const data = await Promise.race([dbPromise, timeoutPromise]) as any;
      console.log('[DB] Sync complete', data);
      setDbUser(data);
    } catch (e: any) {
      console.error('[DB] Sync failed or timed out:', e.message);
      if (e?.code) console.log(`[DB] Error Code: ${e.code}`);
      // Fallback for demo/dev if DB fails
      setDbUser({ id: 'fallback-id', box_quota: 3 });
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initLiff = async () => {
      // 0. Check for manual bypass in URL, localStorage, or cookies first
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const hasCookieBypass = typeof document !== 'undefined' && document.cookie.includes('hubby_bypass=1');
      const isBypass = params?.get('liff-bypass') === '1' || 
                       hasCookieBypass ||
                       (typeof window !== 'undefined' && localStorage.getItem('hubby_skip_liff') === 'true');

      if (isBypass) {
        console.log('[LIFF] Hard bypass triggered - Skipping initialization');
        const mockProfile = { userId: 'mock_line_user_123', displayName: 'Mock User (Bypassed)' };
        setUserProfile(mockProfile);
        // Pre-set a default dbUser synchronously so UI can start loading data immediately
        setDbUser({ id: 'mock_line_user_123', box_quota: 10 });
        
        // Quietly try to sync with DB without blocking
        fetchOrSyncDbUser(mockProfile.userId).catch(() => {});
        
        setIsLoading(false);
        return;
      }

      // Safety timeout: ensure loading stops after 3.5s regardless of SDK status
      timeoutId = setTimeout(() => {
        console.log('[LIFF] Safety timeout triggered');
        setIsLoading(false);
      }, 3500);

      let redirectingToLineLogin = false;
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        
        let profile = null;
        
        // Use Mock data for local testing if LIFF is not configured
        if (!liffId || liffId.includes('YOUR_LIFF_ID_HERE')) {
          console.log('[LIFF] Running in Mock Mode');
          profile = {
            userId: 'mock_line_user_123',
            displayName: 'Dev User',
          };
          setUserProfile(profile);
          await fetchOrSyncDbUser(profile.userId);
          setIsLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        await liff.init({
          liffId,
          // ให้ล็อกอินผ่าน LINE ได้แม้เปิดลิงก์นอกแอป LINE (เบราว์เซอร์)
          withLoginOnExternalBrowser: true,
        });
        setLiffObject(liff);

        if (!liff.isLoggedIn()) {
          redirectingToLineLogin = true;
          const redirectUri =
            typeof window !== 'undefined' ? window.location.href.split('#')[0] : undefined;
          liff.login({ redirectUri });
          return;
        }

        profile = await liff.getProfile();
        setUserProfile(profile);
        if (profile?.userId) {
          await fetchOrSyncDbUser(profile.userId);
        }
      } catch (err: any) {
        console.error('LIFF init failed', err);
        setError(err);
      } finally {
        clearTimeout(timeoutId);
        if (!redirectingToLineLogin) {
          setIsLoading(false);
        }
      }
    };

    initLiff();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <LiffContext.Provider value={{ 
      liff: liffObject, 
      error, 
      userProfile, 
      dbUser,
      isLoading,
      refreshDbUser: async () => {
        if (userProfile?.userId) await fetchOrSyncDbUser(userProfile.userId);
      },
      skipLoading: () => {
        console.log('[LIFF] Manually skipping loading');
        setIsLoading(false);
      }
    }}>
      {children}
    </LiffContext.Provider>
  );
};

export const useLiff = () => useContext(LiffContext);
