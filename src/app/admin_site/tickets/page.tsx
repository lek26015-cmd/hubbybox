'use client';

export default function TicketsPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pb-12 border-b border-white/5">
            <div>
               <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">Support Tickets</h2>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-none">Handle user inquiries and logistics support requests</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="h-10 w-px bg-white/5 mx-2"></div>
               <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-vora-card bg-slate-700 flex items-center justify-center text-[10px] font-black text-white ring-2 ring-vora-accent/20">S{i}</div>
                  ))}
               </div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">4 Staff Online</span>
            </div>
         </header>

         <div className="space-y-6">
            <TicketRow id="#TK-4829" subject="Insurance Claim for Damaged Item" user="John Doe" status="Open" priority="High" time="2h ago" />
            <TicketRow id="#TK-4828" subject="Subscription Tier Update Delay" user="Jane Smith" status="Open" priority="Medium" time="5h ago" />
            <TicketRow id="#TK-4827" subject="Lost Package at Warehouse C" user="Robert Fox" status="Open" priority="Critical" time="1d ago" />
            <TicketRow id="#TK-4826" subject="General Platform Inquiry" user="Alice Wong" status="Closed" priority="Low" time="3d ago" />
         </div>
      </div>
    </main>
  );
}

function TicketRow({ id, subject, user, status, priority, time }: { id: string, subject: string, user: string, status: string, priority: string, time: string }) {
   const priorityColor = priority === 'Critical' ? 'bg-rose-500' : priority === 'High' ? 'bg-amber-500' : priority === 'Medium' ? 'bg-vora-accent' : 'bg-slate-600';
   
   return (
      <div className="bg-vora-card border border-white/5 p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-white/10 transition-all cursor-pointer shadow-xl">
         <div className="flex items-center gap-8">
            <div className="w-12 h-12 rounded-xl bg-vora-dark flex items-center justify-center text-vora-accent shadow-lg group-hover:scale-110 transition-transform">
               <i className="fa-notdog fa-solid fa-headset"></i>
            </div>
            <div>
               <div className="flex items-center gap-4 mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{id}</span>
                  <div className={`px-2 py-0.5 rounded-md ${priorityColor} text-white font-black text-[8px] uppercase tracking-widest shadow-lg shadow-current/20`}>{priority}</div>
               </div>
               <h4 className="text-white font-bold tracking-tight text-lg group-hover:text-vora-accent transition-colors">{subject}</h4>
               <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-widest">Requested by {user} • {time}</p>
            </div>
         </div>
         <div className="flex items-center gap-10">
            <div className="text-right hidden sm:block">
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</p>
               <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'Open' ? 'text-emerald-500' : 'text-slate-500'}`}>{status}</span>
            </div>
            <button className="bg-white/5 border border-white/5 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-vora-accent transition-all">Reply</button>
         </div>
      </div>
   );
}
