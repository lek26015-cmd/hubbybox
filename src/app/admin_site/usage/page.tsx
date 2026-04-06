'use client';

export default function UsagePage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
         <header className="space-y-4 border-b border-admin-border pb-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-vora-accent border border-admin-border shadow-sm ring-4 ring-vora-accent/[0.03]">
                  <i className="fa-solid fa-bullseye text-xl drop-shadow-[0_4px_6px_rgba(52,137,255,0.1)]"></i>
               </div>
               <h2 className="text-4xl font-black text-admin-text-primary tracking-tighter">Usage Rate Analytics</h2>
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] max-w-2xl leading-loose">Deconstruct platform performance metrics and storage utilization efficiency in real-time.</p>
         </header>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MetricBox label="Active Storage" value="84.2%" change="+2.4%" color="text-vora-accent" />
            <MetricBox label="User Retention" value="92.8%" change="+5.1%" color="text-emerald-500" />
            <MetricBox label="Server Response" value="124ms" change="-12ms" color="text-amber-500" />
         </div>

         <div className="bg-admin-card border border-admin-border rounded-2xl p-10 lg:p-14 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-vora-accent/[0.03] rounded-full blur-[100px]"></div>
            <h4 className="text-2xl font-black text-admin-text-primary mb-12 tracking-tighter">Performance Breakdown</h4>
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
      <div className="bg-admin-card border border-admin-border p-10 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all shadow-sm">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{label}</p>
         <h3 className={`text-5xl font-black ${color} tracking-tighter mb-4`}>{value}</h3>
         <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">{change} vs Month</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
         </div>
      </div>
   );
}

function ProgressBar({ label, progress, color }: { label: string, progress: number, color: string }) {
   return (
      <div className="space-y-4">
         <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] shrink-0">{label}</span>
            <span className={`text-xs font-black ${color.replace('bg-', 'text-')} tracking-tighter`}>{progress}%</span>
         </div>
         <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-admin-border p-0.5">
            <div className={`h-full ${color} rounded-full transition-all duration-1000 shadow-sm`} style={{ width: `${progress}%` }}></div>
         </div>
      </div>
   );
}
