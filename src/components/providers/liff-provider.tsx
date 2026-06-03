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
    try {
      // Call server API to create/find user AND set signed session cookie
      const dbPromise = (async () => {
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lineUserId }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Session creation failed (${res.status})`);
        }

        const { userId } = await res.json();

        // Fetch full user data (box_quota etc.) — read-only, safe with anon key
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id, box_quota')
          .eq('id', userId)
          .single();

        if (fetchError) throw fetchError;
        return data;
      })();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('เชื่อมต่อฐานข้อมูลไม่ได้ (ระบบเริ่มต้นช้า) กรุณาลองใหม่อีกครั้ง')), 15000)
      );

      const data = await Promise.race([dbPromise, timeoutPromise]) as { id: string; box_quota: number } | null;
      setDbUser(data);
    } catch (e: unknown) {
      // Preserve real error message for display in auth guard
      const err = e instanceof Error ? e : new Error(String(e) || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
      console.error('[LIFF] fetchOrSyncDbUser error:', err.message);
      setError(err);
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

      if (isBypass && process.env.NODE_ENV === 'development') {

        const mockProfile = { userId: '2f2d2ea0-8013-45e9-8ad6-4418108444e4', displayName: 'Dev User' };
        setUserProfile(mockProfile);
        setDbUser({ id: '2f2d2ea0-8013-45e9-8ad6-4418108444e4', box_quota: 15 });
        setIsLoading(false);
        return;
      }

      // Safety timeout: ensure loading stops eventually.
      // 12s to accommodate Supabase cold starts + slow networks on mobile.
      timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 12000);

      let redirectingToLineLogin = false;
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        
        let profile = null;
        
        // Use Mock data for local testing if LIFF is not configured
        if (!liffId || liffId.includes('YOUR_LIFF_ID_HERE')) {

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
          // Set cookie for middleware
          if (typeof document !== 'undefined') {
            document.cookie = `hubby_liff_logged_in=1; path=/; max-age=2592000; samesite=lax`;
          }
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('LIFF init failed');
        setError(error);
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
