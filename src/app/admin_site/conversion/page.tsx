'use client';

export default function ConversionPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12 pb-24">
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pb-12 border-b border-admin-border">
            <div>
               <h2 className="text-4xl font-black text-admin-text-primary mb-2 tracking-tighter uppercase">Conversions</h2>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Comprehensive sales and revenue funnels</p>
            </div>
            <div className="flex gap-4">
               <button className="px-8 py-3.5 bg-white border border-admin-border rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-admin-text-primary transition-all shadow-sm">Audit Funnel</button>
               <button className="px-8 py-3.5 bg-vora-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-vora-accent/20 active:scale-95 transition-all">Optimize Flow</button>
            </div>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ConversionCard label="Landing Page to Signup" percentage={68} icon="fa-desktop" color="text-vora-accent" />
            <ConversionCard label="Signup to First Deposit" percentage={42} icon="fa-user-plus" color="text-emerald-500" />
            <ConversionCard label="First Deposit to Returning" percentage={31} icon="fa-repeat" color="text-amber-500" />
            <ConversionCard label="Total Growth Metrics" percentage={14} icon="fa-chart-line" color="text-primary" />
         </div>
      </div>
    </main>
  );
}

function ConversionCard({ label, percentage, icon, color }: { label: string, percentage: number, icon: string, color: string }) {
   return (
      <div className="bg-admin-card border border-admin-border p-10 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all flex items-center justify-between shadow-sm">
         <div className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
               <div className={`p-4 bg-white rounded-xl border border-admin-border ${color} shadow-sm ring-4 ring-slate-400/5 group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${icon} text-lg drop-shadow-sm`}></i>
               </div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
            </div>
            <h3 className={`text-6xl font-black ${color} tracking-tighter`}>{percentage}%</h3>
         </div>
         <div className="w-24 h-24 sm:w-32 sm:h-32 relative shrink-0">
            <svg className="w-full h-full transform -rotate-90">
               <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
               <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" 
                       strokeDasharray={2 * Math.PI * 54} 
                       strokeDashoffset={2 * Math.PI * 54 * (1 - percentage / 100)} 
                       className={`${color} stroke-current transition-all duration-1000 delay-300 drop-shadow-sm`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{percentage}%</div>
         </div>
      </div>
   );
}
