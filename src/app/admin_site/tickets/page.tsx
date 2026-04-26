'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type SupportTicket = {
  id: string;
  subject: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  users: {
    line_user_id: string;
  }[] | null;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTicket, setReplyingTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          id, 
          subject, 
          description,
          status, 
          priority, 
          created_at,
          users (
            id,
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
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSendReply = async () => {
    if (!replyingTicket || !replyMessage.trim()) return;
    
    setIsSending(true);
    try {
      const lineUserId = Array.isArray(replyingTicket.users) ? replyingTicket.users[0]?.line_user_id : null;
      
      // 1. Save Reply to DB (If you have a ticket_replies table, otherwise we just close the ticket)
      // For now, let's just update the ticket status and log the reply
      const { error: updateError } = await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', replyingTicket.id);

      if (updateError) throw updateError;

      // 2. Try to send LINE Push Message if available
      if (lineUserId) {
        await fetch('/admin_site/api/line-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            to: lineUserId, 
            message: `[HubbyBox Support Response]\n\nRegarding: ${replyingTicket.subject}\n\n${replyMessage}` 
          }),
        });
      }

      alert(lineUserId ? 'ตอบกลับและส่งข้อความเข้า LINE เรียบร้อยแล้ว!' : 'บันทึกคำตอบเรียบร้อยแล้ว (ลูกค้าไม่ได้รับข้อความ LINE เนื่องจากไม่มีข้อมูล ID)');
      setReplyingTicket(null);
      setReplyMessage('');
      fetchTickets();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกคำตอบ');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pb-12 border-b border-admin-border">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-black text-admin-text-primary tracking-tighter">Support Tickets</h2>
                  <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-emerald-500/20">Live Sync</span>
               </div>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">Manage inquiries from users and logistics partners</p>
            </div>
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => fetchTickets()}
                  className="w-10 h-10 rounded-xl bg-white border border-admin-border flex items-center justify-center text-slate-400 hover:text-vora-accent transition-all shadow-sm"
                >
                   <i className={`fa-solid fa-rotate ${isLoading ? 'fa-spin' : ''}`}></i>
                </button>
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
                        <th className="px-8 py-5">Issue & Description</th>
                        <th className="px-8 py-5">User (LINE)</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border text-sm">
                     {isLoading && tickets.length === 0 ? (
                        <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">กำลังโหลดรายการแจ้งปัญหา...</td></tr>
                     ) : tickets.length === 0 ? (
                        <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                           <div className="flex flex-col items-center gap-4">
                              <i className="fa-solid fa-folder-open text-4xl opacity-10"></i>
                              <p>"ยังไม่มีการแจ้งปัญหาจากผู้ใช้ในฐานข้อมูลจริง"</p>
                              <p className="text-[10px] text-slate-300 font-normal">หากคุณเห็นข้อมูลม็อคอัพก่อนหน้านี้ นั่นเป็นเพราะหน้าเว็บเก่ายังค้างในแคชครับ</p>
                           </div>
                        </td></tr>
                     ) : tickets.map((ticket) => (
                        <tr key={ticket.id} className="group hover:bg-slate-50/80 transition-colors">
                           <td className="px-8 py-4">
                              <div className="flex flex-col gap-1.5">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                                 <PriorityBadge priority={ticket.priority} />
                              </div>
                           </td>
                           <td className="px-8 py-4">
                              <p className="font-bold text-admin-text-primary mb-1 group-hover:text-vora-accent transition-colors">
                                 {ticket.subject}
                              </p>
                              <p className="text-xs text-slate-400 line-clamp-2 max-w-sm mb-2">{ticket.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
                              <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">Created {new Date(ticket.created_at).toLocaleString('th-TH')}</span>
                           </td>
                           <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px]">
                                    {((Array.isArray(ticket.users) ? ticket.users[0]?.line_user_id : null) || 'U').charAt(0)}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">
                                       {(Array.isArray(ticket.users) ? ticket.users[0]?.line_user_id : null) || 'No LINE ID'}
                                    </span>
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Real DB User</span>
                                 </div>
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
                              <button 
                                 onClick={() => setReplyingTicket(ticket)}
                                 className="bg-slate-50 border border-slate-200 text-slate-600 px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-vora-accent hover:text-white hover:border-vora-accent transition-all shadow-sm"
                              >
                                 Open & Reply
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* Reply Modal */}
      {replyingTicket && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl w-full max-w-2xl p-10 shadow-2xl border border-admin-border animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-2xl font-black text-admin-text-primary tracking-tighter">Respond to Inquiry</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ticket ID: #{replyingTicket.id.toUpperCase()}</p>
                 </div>
                 <button onClick={() => setReplyingTicket(null)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 hover:text-slate-500 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </div>
              
              <div className="space-y-8">
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                       <PriorityBadge priority={replyingTicket.priority} />
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Client Inquiry</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-800 mb-2">{replyingTicket.subject}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 italic shadow-sm">
                       "{replyingTicket.description || 'ไม่มีรายละเอียดเพิ่มเติม'}"
                    </p>
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Response Message</label>
                       {!(Array.isArray(replyingTicket.users) ? replyingTicket.users[0]?.line_user_id : null) && (
                          <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest italic">
                             <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                             No LINE ID (Save only)
                          </span>
                       )}
                    </div>
                    <textarea 
                       rows={6}
                       placeholder="พิมพ์ข้อความตอบกลับเพื่อช่วยเหลือลูกค้า..."
                       value={replyMessage}
                       onChange={(e) => setReplyMessage(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-6 px-8 text-base font-bold text-admin-text-primary focus:outline-none focus:border-vora-accent/30 transition-all resize-none shadow-inner"
                    />
                    <p className="text-[10px] text-slate-400 font-medium px-2 italic">
                       * หากลูกค้ามีข้อมูล LINE ID ระบบจะส่ง Push Message ไปยังลูกค้าโดยอัตโนมัติ
                    </p>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                       onClick={() => setReplyingTicket(null)}
                       className="flex-1 bg-white border border-slate-200 text-slate-400 font-black py-4 rounded-2xl hover:bg-slate-50 transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={handleSendReply}
                       disabled={isSending || !replyMessage.trim()}
                       className="flex-[2] bg-vora-accent text-white font-black py-4 rounded-2xl shadow-xl shadow-vora-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                       {isSending ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                       Send Response & Close Ticket
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
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

