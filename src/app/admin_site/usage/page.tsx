'use client';

export default function UsagePage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 bg-gradient-to-br from-vora-dark to-vora-card/50">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
         <header className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-vora-accent border border-white/5 shadow-2xl">
                  <i className="fa-notdog fa-solid fa-bullseye-arrow text-xl"></i>
               </div>
               <h2 className="text-4xl font-black text-white tracking-tighter">Usage Rate Analytics</h2>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] max-w-2xl leading-loose">Deconstruct platform performance metrics and storage utilization efficiency in real-time.</p>
         </header>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MetricBox label="Active Storage" value="84.2%" change="+2.4%" color="text-vora-accent" />
            <MetricBox label="User Retention" value="92.8%" change="+5.1%" color="text-emerald-500" />
            <MetricBox label="Server Response" value="124ms" change="-12ms" color="text-amber-500" />
         </div>

         <div className="bg-vora-card border border-white/5 rounded-[2rem] p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-vora-accent/5 rounded-full blur-[100px] group-hover:bg-vora-accent/10 transition-all duration-1000"></div>
            <h4 className="text-2xl font-black text-white mb-12 tracking-tighter">Performance Breakdown</h4>
            <div className="space-y-12">
               <ProgressBar label="API Throughput" progress={85} color="bg-vora-accent" />
               <ProgressBar label="Database Read/Write" progress={62} color="bg-emerald-500" />
               <ProgressBar label="CDN Edge Delivery" progress={94} color="bg-primary" />
               <ProgressBar label="Storage Capacity" progress={41} color="bg-rose-500" />
            </div>
         </div>
      </div>
    </main>
  );
}

function MetricBox({ label, value, change, color }: { label: string, value: string, change: string, color: string }) {
   return (
      <div className="bg-vora-card border border-white/5 p-10 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all">
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">{label}</p>
         <h3 className={`text-5xl font-black ${color} tracking-tighter mb-4`}>{value}</h3>
         <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{change} vs Last Month</span>
      </div>
   );
}

function ProgressBar({ label, progress, color }: { label: string, progress: number, color: string }) {
   return (
      <div className="space-y-4">
         <div className="flex justify-between items-center px-2">
            <span className="text-xs font-black text-white uppercase tracking-widest">{label}</span>
            <span className={`text-xs font-black ${color.replace('bg-', 'text-')} tracking-tighter`}>{progress}%</span>
         </div>
         <div className="w-full h-3 bg-vora-dark rounded-full overflow-hidden border border-white/5 p-0.5">
            <div className={`h-full ${color} rounded-full shadow-[0_0_15px_currentColor] transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
         </div>
      </div>
   );
}
