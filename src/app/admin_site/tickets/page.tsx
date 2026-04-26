'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type SupportTicket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  users: {
    line_user_id: string;
  } | null;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const { data, error } = await supabase
          .from('support_tickets')
          .select(`
            id, 
            subject, 
            status, 
            priority, 
            created_at,
            users (
              line_user_id
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setTickets(data as SupportTicket[] || []);
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTickets();
  }, []);

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
                   <div className="w-10 h-10 rounded-full border-2 border-white bg-vora-accent flex items-center justify-center text-[11px] font-black text-white ring-4 ring-slate-400/[0.03] shadow-sm hover:translate-y-[-2px] transition-transform cursor-pointer">SA</div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">SuperAdmin Online</span>
             </div>
         </header>

         <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-admin-border text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <th className="px-8 py-5">ID & Priority</th>
                        <th className="px-8 py-5">Subject</th>
                        <th className="px-8 py-5">Requestor (LINE ID)</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border text-sm">
                     {isLoading ? (
                        <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">กำลังโหลดรายการแจ้งปัญหา...</td></tr>
                     ) : tickets.length === 0 ? (
                        <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">"ยังไม่มีการแจ้งปัญหาจากผู้ใช้ในขณะนี้"</td></tr>
                     ) : tickets.map((ticket) => (
                        <tr key={ticket.id} className="group hover:bg-slate-50/80 transition-colors">
                           <td className="px-8 py-4">
                              <div className="flex flex-col gap-1.5">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                                 <PriorityBadge priority={ticket.priority} />
                              </div>
                           </td>
                           <td className="px-8 py-4">
                              <p className="font-bold text-admin-text-primary mb-0.5 group-hover:text-vora-accent transition-colors">
                                 {ticket.subject}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium">Created {new Date(ticket.created_at).toLocaleString('th-TH')}</span>
                           </td>
                           <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px]">
                                    {(ticket.users?.line_user_id || 'U').charAt(0)}
                                 </div>
                                 <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">
                                    {ticket.users?.line_user_id || 'Unknown'}
                                 </span>
                              </div>
                           </td>
                           <td className="px-8 py-4">
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest ${
                                 ticket.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
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
   const p = priority.toLowerCase();
   const colors = p === 'critical' ? 'bg-rose-500 text-white' : 
                  p === 'high' ? 'bg-amber-100 text-amber-700' : 
                  p === 'medium' ? 'bg-sky-100 text-sky-700' : 
                  'bg-slate-100 text-slate-600';
   
   return (
      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest w-fit ${colors}`}>
         {priority}
      </div>
   );
}

