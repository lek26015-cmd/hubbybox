'use client';

import { useAdminAuth } from '@/components/auth/admin-auth-provider';
import Image from 'next/image';

export default function AdminSettingsPage() {
  const { user, signOut } = useAdminAuth();

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-3xl mx-auto space-y-10 pb-24">
        <header className="pb-8 border-b border-admin-border">
          <h2 className="text-3xl font-black text-admin-text-primary mb-2 tracking-tighter">Settings</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Admin account and system configuration</p>
        </header>

        {/* Profile Card */}
        <section className="bg-admin-card border border-admin-border rounded-2xl p-8 shadow-sm">
          <h3 className="font-black text-sm text-slate-400 uppercase tracking-widest mb-6">Admin Account</h3>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-admin-border flex items-center justify-center overflow-hidden shadow-sm">
              {user?.user_metadata?.avatar_url ? (
                <Image 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  width={64} 
                  height={64} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <i className="fa-solid fa-user-shield text-2xl text-vora-accent" aria-hidden="true"></i>
              )}
            </div>
            <div>
              <p className="font-black text-lg text-admin-text-primary">{user?.user_metadata?.full_name || 'Admin'}</p>
              <p className="text-xs font-bold text-slate-400">{user?.email || 'ไม่ทราบอีเมล'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-admin-border">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-shield-halved text-vora-accent" aria-hidden="true"></i>
                <span className="text-sm font-bold text-admin-text-primary">Authentication Provider</span>
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-admin-border">Google OAuth</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-admin-border">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-clock text-slate-400" aria-hidden="true"></i>
                <span className="text-sm font-bold text-admin-text-primary">Last Sign In</span>
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {user?.last_sign_in_at 
                  ? new Date(user.last_sign_in_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '-'
                }
              </span>
            </div>
          </div>
        </section>

        {/* System Info */}
        <section className="bg-admin-card border border-admin-border rounded-2xl p-8 shadow-sm">
          <h3 className="font-black text-sm text-slate-400 uppercase tracking-widest mb-6">System Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-admin-border">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Version</p>
              <p className="font-black text-admin-text-primary">HubbyBox v2.0.4</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-admin-border">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Environment</p>
              <p className="font-black text-admin-text-primary">{process.env.NODE_ENV}</p>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-admin-card border border-rose-200 rounded-2xl p-8 shadow-sm">
          <h3 className="font-black text-sm text-rose-500 uppercase tracking-widest mb-6">Danger Zone</h3>
          <button
            onClick={signOut}
            className="w-full sm:w-auto bg-rose-500 text-white font-black px-10 py-4 rounded-xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm"
          >
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
            ออกจากระบบ
          </button>
        </section>
      </div>
    </main>
  );
}
