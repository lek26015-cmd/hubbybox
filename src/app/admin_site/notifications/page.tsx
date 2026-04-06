'use client';

export default function NotificationsPage() {
  const notifications = [
    { type: 'Alert', message: 'New box deposit request from user @tawan', time: '2 mins ago', icon: 'fa-box-open', color: 'text-vora-accent' },
    { type: 'Security', message: 'Unauthorized login attempt from unknown IP', time: '1 hour ago', icon: 'fa-shield-halved', color: 'text-rose-500' },
    { type: 'Update', message: 'Platform maintenance scheduled for May 1st', time: '3 hours ago', icon: 'fa-wrench', color: 'text-amber-500' },
    { type: 'Success', message: 'Monthly revenue target achieved: $500k+', time: '1 day ago', icon: 'fa-circle-check', color: 'text-emerald-500' },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-3xl mx-auto space-y-12">
         <header className="flex items-center justify-between gap-6 pb-6 border-b border-white/5">
            <h2 className="text-3xl font-black text-white tracking-tighter">Notifications Center</h2>
            <button className="text-[10px] font-black text-vora-accent uppercase tracking-widest hover:underline">Mark All as Read</button>
         </header>

         <div className="space-y-4">
            {notifications.map((n, i) => (
               <div key={i} className="bg-vora-card border border-white/5 p-6 rounded-2xl flex items-center gap-6 hover:bg-white/5 transition-all group cursor-pointer shadow-xl">
                  <div className={`w-12 h-12 rounded-xl bg-vora-dark flex items-center justify-center ${n.color} shadow-lg transition-transform group-hover:scale-110`}>
                     <i className={`fa-solid ${n.icon}`}></i>
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${n.color}`}>{n.type}</span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{n.time}</span>
                     </div>
                     <p className="text-white font-bold tracking-tight group-hover:text-vora-accent transition-colors">{n.message}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </main>
  );
}
