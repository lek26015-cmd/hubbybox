'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type UserData = {
  id: string;
  line_user_id: string;
  box_quota: number;
  created_at: string;
};

export default function ManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10 pb-24">
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
               <h2 className="text-3xl font-black text-admin-text-primary mb-2 tracking-tighter">User Management</h2>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Manage platform users, roles and permissions</p>
            </div>
            <button className="bg-vora-accent text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-vora-accent/20 active:scale-95 transition-all w-fit">
               Add New Staff
            </button>
         </header>

         {/* User Table */}
         <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-admin-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
               <div className="flex gap-2">
                  <div className="px-5 py-2 bg-vora-accent text-white text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer shadow-lg shadow-vora-accent/20">All Users</div>
                  <div className="px-5 py-2 hover:bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all">Staff Only</div>
               </div>
               <div className="relative group">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input type="text" placeholder="Search users..." className="bg-white border border-admin-border rounded-lg py-2 pl-10 pr-4 text-[11px] text-admin-text-primary focus:outline-none focus:border-vora-accent/40 w-full md:w-72 shadow-inner" />
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30 border-b border-admin-border">
                        <th className="px-8 py-4">User Identity</th>
                        <th className="px-8 py-4">Role</th>
                        <th className="px-8 py-4">Box Quota</th>
                        <th className="px-8 py-4">Joined</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border text-sm">
                     {/* Static Super Admin Row */}
                     <tr className="bg-vora-accent/[0.02] group">
                        <td className="px-8 py-4">
                           <div className="flex items-center gap-4">
                              <div className="w-9 h-9 rounded-lg bg-vora-accent text-white flex items-center justify-center font-black text-xs shadow-lg shadow-vora-accent/20">
                                 SA
                              </div>
                              <div className="min-w-0">
                                 <p className="text-admin-text-primary font-black text-xs tracking-tight">SuperAdmin (You)</p>
                                 <p className="text-[9px] font-bold text-vora-accent uppercase tracking-widest">Platform Owner</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-4">
                           <span className="text-[9px] font-black text-white uppercase tracking-widest py-1 px-2.5 bg-vora-accent rounded shadow-sm">Super Admin</span>
                        </td>
                        <td className="px-8 py-4 text-[10px] text-slate-400 font-bold uppercase">Unlimited</td>
                        <td className="px-8 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">System</td>
                        <td className="px-8 py-4 text-right">
                           <i className="fa-solid fa-lock text-slate-300 text-xs mr-3"></i>
                        </td>
                     </tr>

                     {/* Database Users */}
                     {users.map((user) => (
                        <tr key={user.id} className="group hover:bg-slate-50 transition-colors">
                           <td className="px-8 py-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-9 h-9 rounded-lg bg-slate-100 border border-admin-border flex items-center justify-center text-slate-400 font-black text-xs uppercase">
                                    {user.line_user_id.charAt(0)}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-admin-text-primary font-bold text-xs truncate max-w-[200px]">ID: {user.line_user_id}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">Internal ID: {user.id.slice(0, 8)}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-4">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest py-1 px-2.5 bg-slate-50 rounded border border-admin-border">User</span>
                           </td>
                           <td className="px-8 py-4 text-xs font-black text-admin-text-primary">{user.box_quota} Boxes</td>
                           <td className="px-8 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {new Date(user.created_at).toLocaleDateString('th-TH')}
                           </td>
                           <td className="px-8 py-4 text-right">
                              <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-admin-text-primary transition-all flex items-center justify-center border border-transparent hover:border-admin-border">
                                 <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {users.length === 0 && !isLoading && (
                  <div className="py-20 text-center text-slate-400 italic">
                     <p>ยังไม่มีผู้ใช้รายอื่นในระบบ</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </main>
  );
}

