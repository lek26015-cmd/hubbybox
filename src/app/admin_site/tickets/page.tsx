'use client';
import Link from 'next/link';

export default function TicketsPage() {
  const tickets = [
    { id: "#TK-4829", subject: "Insurance Claim for Damaged Item", user: "John Doe", status: "Open", priority: "High", time: "2h ago" },
    { id: "#TK-4828", subject: "Subscription Tier Update Delay", user: "Jane Smith", status: "Open", priority: "Medium", time: "5h ago" },
    { id: "#TK-4827", subject: "Lost Package at Warehouse C", user: "Robert Fox", status: "Open", priority: "Critical", time: "1d ago" },
    { id: "#TK-4826", subject: "General Platform Inquiry", user: "Alice Wong", status: "Closed", priority: "Low", time: "3d ago" },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pb-12 border-b border-admin-border">
            <div>
               <h2 className="text-3xl font-black text-admin-text-primary mb-2 tracking-tighter">Support Tickets</h2>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">Handle user inquiries and logistics support requests</p>
            </div>
             <div className="flex items-center gap-3">
                <div className="h-10 w-px bg-admin-border mx-2"></div>
                <div className="flex -space-x-2.5">
                   {['PP', 'JS', 'RF', 'AW'].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[11px] font-black text-admin-text-primary ring-4 ring-slate-400/[0.03] shadow-sm hover:translate-y-[-2px] transition-transform cursor-pointer">{i}</div>
                   ))}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">4 Staff Online</span>
             </div>
         </header>

         <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-admin-border text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <th className="px-8 py-5">ID & Priority</th>
                        <th className="px-8 py-5">Subject</th>
                        <th className="px-8 py-5">Requestor</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border text-sm">
                     {tickets.map((ticket, i) => (
                        <tr key={ticket.id} className="group hover:bg-slate-50/80 transition-colors">
                           <td className="px-8 py-4">
                              <div className="flex flex-col gap-1.5">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{ticket.id}</span>
                                 <PriorityBadge priority={ticket.priority} />
                              </div>
                           </td>
                           <td className="px-8 py-4">
                              <p className="font-bold text-admin-text-primary mb-0.5 group-hover:text-vora-accent transition-colors">
                                 {ticket.subject}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium">Updated {ticket.time}</span>
                           </td>
                           <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px]">
                                    {ticket.user.charAt(0)}
                                 </div>
                                 <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{ticket.user}</span>
                              </div>
                           </td>
                           <td className="px-8 py-4">
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest ${
                                 ticket.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                              }`}>
                                 {ticket.status}
                              </span>
                           </td>
                           <td className="px-8 py-4 text-right">
                              <button className="bg-slate-50 border border-slate-200 text-slate-600 px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-vora-accent hover:text-white hover:border-vora-accent transition-all shadow-sm">
                                 Reply
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

function PriorityBadge({ priority }: { priority: string }) {
   const colors = priority === 'Critical' ? 'bg-rose-500 text-white' : 
                  priority === 'High' ? 'bg-amber-100 text-amber-700' : 
                  priority === 'Medium' ? 'bg-sky-100 text-sky-700' : 
                  'bg-slate-100 text-slate-600';
   
   return (
      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest w-fit ${colors}`}>
         {priority}
      </div>
   );
}
