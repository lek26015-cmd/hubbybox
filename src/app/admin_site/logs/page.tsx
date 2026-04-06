'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase.from('boxes').select('*').order('created_at', { ascending: false }).limit(20);
      if (data) setLogs(data);
    };
    fetchLogs();
  }, []);

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10 pb-24">
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-admin-border">
            <div>
               <h2 className="text-3xl font-black text-admin-text-primary mb-2 tracking-tighter">System Audit Logs</h2>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Real-time platform activity and audit trails</p>
            </div>
            <div className="flex items-center gap-4">
               <button className="bg-white border border-admin-border text-slate-500 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-admin-text-primary transition-all shadow-sm">
                  Export CSV
               </button>
               <button className="bg-vora-accent text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-vora-accent/20 active:scale-95 transition-all">
                  Refresh Data
               </button>
            </div>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
               <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-50 border-b border-admin-border text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                              <th className="px-8 py-4">Event</th>
                              <th className="px-8 py-4">Details</th>
                              <th className="px-8 py-4">Time</th>
                              <th className="px-8 py-4 text-right">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border bg-white">
                           {logs.map((log, i) => (
                              <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                 <td className="px-8 py-4">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-lg bg-white border border-admin-border flex items-center justify-center text-vora-accent shadow-sm ring-4 ring-vora-accent/[0.03] group-hover:scale-110 transition-transform">
                                          <i className={`fa-solid ${log.status === 'returning' ? 'fa-truck-fast' : 'fa-box-open'} text-sm drop-shadow-sm`}></i>
                                       </div>
                                       <p className="text-admin-text-primary font-bold text-xs tracking-tight">Box {log.name}</p>
                                    </div>
                                 </td>
                                 <td className="px-8 py-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.status || 'Verified'}</span>
                                 </td>
                                 <td className="px-8 py-4">
                                    <span className="text-[10px] font-bold text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</span>
                                 </td>
                                 <td className="px-8 py-4 text-right">
                                    <span className={`text-[9px] font-black py-1 px-3 rounded-full border ${
                                       log.status === 'returning' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                    }`}>
                                       {log.status === 'returning' ? 'Success' : 'Ready'}
                                    </span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            <aside className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-8">
               <div className="bg-admin-card border border-admin-border rounded-2xl p-10 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900">
                     <i className="fa-solid fa-server text-8xl"></i>
                  </div>
                  <h4 className="text-lg font-black text-admin-text-primary mb-8 tracking-tighter">Event Filtering</h4>
                  <div className="space-y-6">
                     <FilterItem label="Log Level" value="All Levels" icon="fa-layer-group" />
                     <FilterItem label="Module" value="Logistics System" icon="fa-microchip" />
                     <FilterItem label="Time Range" value="Last 24 Hours" icon="fa-clock" />
                  </div>
                  <button className="w-full mt-12 bg-slate-50 border border-slate-200 text-slate-400 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all">
                     Apply New Filters
                  </button>
               </div>

               <div className="bg-slate-50 border border-admin-border p-10 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Live Monitoring Active</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed tracking-tight">System is currently processing events from 4 nodes with 0 latency.</p>
               </div>
            </aside>
         </div>
      </div>
    </main>
  );
}

function FilterItem({ label, value, icon }: { label: string, value: string, icon: string }) {
   return (
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-admin-border cursor-pointer hover:border-vora-accent/40 transition-all group shadow-sm">
         <div className="flex items-center gap-4">
            <i className={`fa-solid ${icon} text-slate-400 text-xs group-hover:text-vora-accent transition-colors`}></i>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
         </div>
         <span className="text-[10px] font-black text-admin-text-primary uppercase tracking-widest">{value}</span>
      </div>
   );
}
