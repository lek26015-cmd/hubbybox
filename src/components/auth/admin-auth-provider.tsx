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

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Validate session with server on mount
    async function validateSession() {
      try {
        const res = await fetch('/admin_site/api/auth', { method: 'GET' });
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    validateSession();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin_site/login' && pathname !== '/login') {
      router.push('/admin_site/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const signInWithPasscode = async (passcode: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/admin_site/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        throw new Error(data.error || 'Login failed');
      }

      setIsAuthenticated(true);
      router.push('/admin_site');
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await fetch('/admin_site/api/auth', { method: 'DELETE' });
    } catch {
      // Proceed with client-side logout even if server call fails
    }
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
