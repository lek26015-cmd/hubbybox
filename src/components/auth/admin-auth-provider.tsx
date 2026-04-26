'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

/**
 * อีเมลที่อนุญาตให้เข้า Admin Dashboard
 * เพิ่ม/ลบอีเมลที่ต้องการได้ตรงนี้ หรือย้ายไปเป็น env var ในอนาคต
 */
const ADMIN_EMAILS: string[] = [
  // TODO: เพิ่มอีเมลแอดมินจริงที่นี่
  // 'admin@hubbybox.app',
];

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Whitelist check: ถ้ามี whitelist และอีเมลไม่อยู่ในลิสต์ → sign out ทันที
      if (_event === 'SIGNED_IN' && session?.user) {
        const email = session.user.email || '';
        if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email)) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
      }

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (_event === 'SIGNED_IN') {
        router.refresh();
      }
      if (_event === 'SIGNED_OUT') {
        router.push('/admin_site/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin_site/login');
  };

  return (
    <AdminAuthContext.Provider value={{ user, session, isLoading, signOut, signInWithGoogle }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
