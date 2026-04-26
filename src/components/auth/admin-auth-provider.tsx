'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithPasscode: (passcode: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'hubbyadmin'; // ดึงจาก env หรือใช้ค่าเริ่มต้นถ้ายังไม่ได้ตั้ง

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage for auth state
    const isAuth = localStorage.getItem('hubby_admin_auth') === 'true';
    setIsAuthenticated(isAuth);
    setIsLoading(false);

    if (!isAuth && pathname !== '/admin_site/login') {
      router.push('/admin_site/login');
    }
  }, [pathname, router]);

  const signInWithPasscode = async (passcode: string) => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (passcode === ADMIN_PASSCODE) {
      localStorage.setItem('hubby_admin_auth', 'true');
      setIsAuthenticated(true);
      router.push('/admin_site');
    } else {
      setIsLoading(false);
      throw new Error('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const signOut = async () => {
    localStorage.removeItem('hubby_admin_auth');
    setIsAuthenticated(false);
    router.push('/admin_site/login');
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, signInWithPasscode, signOut }}>
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
