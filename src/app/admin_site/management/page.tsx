'use client';

export default function ManagementPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10 pb-24">
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
               <h2 className="text-3xl font-black text-admin-text-primary mb-2 tracking-tighter">User Management</h2>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Manage platform users, roles and permissions</p>
            </div>
            <button className="bg-vora-accent text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-vora-accent/20 active:scale-95 transition-all w-fit">
               Add New User
            </button>
         </header>

         {/* Enhanced compact table */}
         <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-admin-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
               <div className="flex gap-2">
                  <div className="px-5 py-2 bg-vora-accent text-white text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer shadow-lg shadow-vora-accent/20">All Users</div>
                  <div className="px-5 py-2 hover:bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all">Admins</div>
                  <div className="px-5 py-2 hover:bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all">Staff</div>
               </div>
               <div className="relative group">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs transition-colors group-focus-within:text-vora-accent"></i>
                  <input type="text" placeholder="Search by name or email..." className="bg-white border border-admin-border rounded-lg py-2 pl-10 pr-4 text-[11px] text-admin-text-primary focus:outline-none focus:border-vora-accent/40 w-full md:w-72 transition-all shadow-inner" />
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30 border-b border-admin-border">
                        <th className="px-8 py-4">User Details</th>
                        <th className="px-8 py-4">Role</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Joined</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border text-sm">
                     {[
                        { name: 'Peter Parkur', email: 'peter@hubbybox.com', role: 'Super Admin', status: 'Active', date: '24 Apr 2026' },
                        { name: 'Jane Smith', email: 'jane.s@hubbybox.com', role: 'Staff', status: 'Active', date: '12 Jan 2026' },
                        { name: 'Robert Fox', email: 'robert@hubbybox.com', role: 'User', status: 'Inactive', date: '08 Mar 2026' },
                        { name: 'Alice Wong', email: 'alice.w@hubbybox.com', role: 'Staff', status: 'Pending', date: '01 Apr 2026' },
                     ].map((user, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-9 h-9 rounded-lg bg-slate-100 border border-admin-border flex items-center justify-center text-vora-accent font-black text-xs uppercase shadow-sm">
                                    {user.name.charAt(0)}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-admin-text-primary font-bold text-xs tracking-tight truncate">{user.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{user.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-4">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest py-1 px-2.5 bg-slate-50 rounded border border-admin-border shadow-sm">{user.role}</span>
                           </td>
                           <td className="px-8 py-4">
                              <div className="flex items-center gap-2">
                                 <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : user.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{user.status}</span>
                              </div>
                           </td>
                           <td className="px-8 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.date}</td>
                           <td className="px-8 py-4 text-right">
                              <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-admin-text-primary transition-all flex items-center justify-center border border-transparent hover:border-admin-border">
                                 <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </main>
  );
}
