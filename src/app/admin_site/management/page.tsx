'use client';

export default function ManagementPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
               <h2 className="text-3xl font-black text-white mb-2">User Management</h2>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Manage platform users, roles and permissions</p>
            </div>
            <button className="bg-vora-accent text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-vora-accent/20 active:scale-95 transition-all w-fit">
               Add New User
            </button>
         </header>

         {/* Placeholder table */}
         <div className="bg-vora-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <div className="flex gap-4">
                  <div className="px-5 py-2 bg-vora-accent text-white text-[10px] font-extrabold uppercase tracking-widest rounded-lg cursor-pointer">All Users</div>
                  <div className="px-5 py-2 hover:bg-white/5 text-slate-500 text-[10px] font-extrabold uppercase tracking-widest rounded-lg cursor-pointer transition-all">Admins</div>
                  <div className="px-5 py-2 hover:bg-white/5 text-slate-500 text-[10px] font-extrabold uppercase tracking-widest rounded-lg cursor-pointer transition-all">Staff</div>
               </div>
               <div className="relative group">
                  <i className="fa-notdog fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs transition-colors group-focus-within:text-vora-accent"></i>
                  <input type="text" placeholder="Filter by Name..." className="bg-vora-dark border border-white/5 rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-vora-accent/30 w-64 transition-all" />
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white/[0.01]">
                        <th className="px-8 py-5">User</th>
                        <th className="px-8 py-5">Role</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5">Joined</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {[
                        { name: 'Peter Parkur', email: 'peter@hubbybox.com', role: 'Super Admin', status: 'Active', date: '24 Apr 2026' },
                        { name: 'Jane Smith', email: 'jane.s@hubbybox.com', role: 'Staff', status: 'Active', date: '12 Jan 2026' },
                        { name: 'Robert Fox', email: 'robert@hubbybox.com', role: 'User', status: 'Inactive', date: '08 Mar 2026' },
                        { name: 'Alice Wong', email: 'alice.w@hubbybox.com', role: 'Staff', status: 'Pending', date: '01 Apr 2026' },
                     ].map((user, i) => (
                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-lg bg-vora-dark border border-white/5 flex items-center justify-center text-vora-accent font-black text-xs uppercase">
                                    {user.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-white font-bold text-sm tracking-tight">{user.name}</p>
                                    <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-widest">{user.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-1.5 px-3 bg-white/5 rounded-md border border-white/5">{user.role}</span>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
                                 <span className="text-[10px] font-black text-white uppercase tracking-widest">{user.status}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-xs text-slate-500 font-bold uppercase tracking-widest">{user.date}</td>
                           <td className="px-8 py-6 text-right">
                              <button className="text-slate-600 hover:text-white transition-colors">
                                 <i className="fa-notdog fa-solid fa-ellipsis-vertical"></i>
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
