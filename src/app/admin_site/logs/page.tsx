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
      <div className="max-w-7xl mx-auto space-y-10">
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div>
               <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">System Audit Logs</h2>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Real-time platform activity and audit trails</p>
            </div>
            <div className="flex items-center gap-4">
               <button className="bg-vora-card border border-white/5 text-slate-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">
                  Export CSV
               </button>
               <button className="bg-vora-accent text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-vora-accent/20 active:scale-95 transition-all">
                  Refresh Data
               </button>
            </div>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
               <div className="bg-vora-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-8 space-y-4">
                     {logs.map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-6 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5 group">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-xl bg-vora-dark flex items-center justify-center text-vora-accent shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                                 <i className={`fa-notdog fa-solid ${log.status === 'returning' ? 'fa-truck-fast' : 'fa-box-open'}`}></i>
                              </div>
                              <div>
                                 <p className="text-white font-bold text-sm tracking-tight">Box {log.name} Update</p>
                                 <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-[0.2em]">{log.status || 'Verified'} • {new Date(log.created_at).toLocaleTimeString()}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                              <span className="text-[9px] font-black py-1 px-3 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">{log.status === 'returning' ? 'Success' : 'Ready'}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <aside className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-8">
               <div className="bg-vora-card border border-white/5 rounded-2xl p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <i className="fa-notdog fa-solid fa-server text-8xl"></i>
                  </div>
                  <h4 className="text-lg font-black text-white mb-8 tracking-tighter">Event Filtering</h4>
                  <div className="space-y-6">
                     <FilterItem label="Log Level" value="All Levels" icon="fa-layer-group" />
                     <FilterItem label="Module" value="Logistics System" icon="fa-microchip" />
                     <FilterItem label="Time Range" value="Last 24 Hours" icon="fa-clock" />
                  </div>
                  <button className="w-full mt-12 bg-white/5 text-slate-400 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
                     Apply New Filters
                  </button>
               </div>

               <div className="bg-gradient-to-br from-vora-accent/20 to-vora-card border border-vora-accent/20 p-10 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_emerald]"></div>
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Live Monitoring Active</span>
                  </div>
                  <p className="text-xs text-white/60 font-bold leading-relaxed tracking-tight">System is currently processing events from 4 nodes with 0 latency.</p>
               </div>
            </aside>
         </div>
      </div>
    </main>
  );
}

function FilterItem({ label, value, icon }: { label: string, value: string, icon: string }) {
   return (
      <div className="flex items-center justify-between p-4 bg-vora-dark rounded-xl border border-white/5 cursor-pointer hover:border-vora-accent/20 transition-all group">
         <div className="flex items-center gap-4">
            <i className={`fa-notdog fa-solid ${icon} text-slate-600 text-xs group-hover:text-vora-accent`}></i>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
         </div>
         <span className="text-[10px] font-black text-white uppercase tracking-widest">{value}</span>
      </div>
   );
}
