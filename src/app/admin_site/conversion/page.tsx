'use client';

export default function ConversionPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pb-12 border-b border-white/5">
            <div>
               <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Conversions</h2>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Comprehensive sales and revenue funnels</p>
            </div>
            <div className="flex gap-4">
               <button className="px-8 py-3.5 bg-vora-dark border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Audit Funnel</button>
               <button className="px-8 py-3.5 bg-vora-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-vora-accent/20 active:scale-95 transition-all">Optimize Flow</button>
            </div>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <ConversionCard label="Landing Page to Signup" percentage={68} icon="fa-desktop" color="text-vora-accent" />
            <ConversionCard label="Signup to First Deposit" percentage={42} icon="fa-user-plus" color="text-emerald-500" />
            <ConversionCard label="First Deposit to Returning User" percentage={31} icon="fa-repeat" color="text-amber-500" />
            <ConversionCard label="Total Revenue to Growth" percentage={14} icon="fa-chart-line" color="text-primary" />
         </div>
      </div>
    </main>
  );
}

function ConversionCard({ label, percentage, icon, color }: { label: string, percentage: number, icon: string, color: string }) {
   return (
      <div className="bg-vora-card border border-white/5 p-12 rounded-[2rem] relative overflow-hidden group hover:border-white/10 transition-all flex items-center justify-between shadow-2xl">
         <div className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
               <div className={`p-4 bg-vora-dark rounded-xl border border-white/5 ${color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                  <i className={`fa-notdog fa-solid ${icon} text-lg`}></i>
               </div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <h3 className={`text-6xl font-black ${color} tracking-tighter`}>{percentage}%</h3>
         </div>
         <div className="w-32 h-32 relative">
            <svg className="w-full h-full transform -rotate-90">
               <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-vora-dark" />
               <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" 
                       strokeDasharray={2 * Math.PI * 54} 
                       strokeDashoffset={2 * Math.PI * 54 * (1 - percentage / 100)} 
                       className={`${color} stroke-current drop-shadow-[0_0_15px_currentColor] transition-all duration-1000 delay-300`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white opacity-20 uppercase tracking-widest">{percentage}%</div>
         </div>
      </div>
   );
}
