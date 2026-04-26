'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { BOX_STATUS } from '@/lib/hubbybox-constants';

type SystemNotification = {
  id: string;
  type: string;
  message: string;
  time: string;
  icon: string;
  color: string;
  timestamp: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRealData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch New Boxes (Shipping to Warehouse)
      const { data: boxes } = await supabase
        .from('boxes')
        .select('id, name, created_at, status')
        .eq('status', BOX_STATUS.SHIPPING_TO_WAREHOUSE)
        .order('created_at', { ascending: false })
        .limit(5);

      // 2. Fetch Support Tickets
      const { data: tickets } = await supabase
        .from('support_tickets')
        .select('id, subject, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      const combined: SystemNotification[] = [];

      boxes?.forEach(box => {
         combined.push({
            id: `box-${box.id}`,
            type: 'Alert',
            message: `New box deposit: "${box.name}" (#${box.id.substring(0, 8)})`,
            time: '', // Will calculate below
            icon: 'fa-box-open',
            color: 'text-vora-accent',
            timestamp: box.created_at
         });
      });

      tickets?.forEach(ticket => {
         combined.push({
            id: `ticket-${ticket.id}`,
            type: 'Support',
            message: `New support request: "${ticket.subject}"`,
            time: '',
            icon: 'fa-headset',
            color: 'text-sky-400',
            timestamp: ticket.created_at
         });
      });

      // Sort by timestamp
      combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setNotifications(combined);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealData();
  }, [fetchRealData]);

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-3xl mx-auto space-y-12">
         <header className="flex items-center justify-between gap-6 pb-6 border-b border-white/5">
            <h2 className="text-3xl font-bold text-white tracking-tighter">Notifications Center</h2>
            <button 
              onClick={() => fetchRealData()}
              className="text-[10px] font-bold text-vora-accent uppercase tracking-widest hover:underline"
            >
               Mark All as Read
            </button>
         </header>

         {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <i className="fa-solid fa-spinner fa-spin text-vora-accent text-4xl" aria-hidden="true"></i>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching live events...</p>
            </div>
         ) : notifications.length === 0 ? (
            <div className="bg-vora-card border border-white/5 p-12 rounded-2xl text-center">
               <i className="fa-solid fa-bell-slash text-slate-700 text-5xl mb-6" aria-hidden="true"></i>
               <p className="text-white font-bold">No active notifications</p>
               <p className="text-slate-500 text-sm mt-2">Everything is running smoothly on the platform.</p>
            </div>
         ) : (
            <div className="space-y-4">
               {notifications.map((n) => (
                  <div key={n.id} className="bg-vora-card border border-white/5 p-6 rounded-2xl flex items-center gap-6 hover:bg-white/5 transition-all group cursor-pointer shadow-xl">
                     <div className={`w-12 h-12 rounded-xl bg-vora-dark flex items-center justify-center ${n.color} shadow-lg transition-transform group-hover:scale-110`}>
                        <i className={`fa-solid ${n.icon}`} aria-hidden="true"></i>
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                           <span className={`text-[10px] font-bold uppercase tracking-widest ${n.color}`}>{n.type}</span>
                           <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{getTimeAgo(n.timestamp)}</span>
                        </div>
                        <p className="text-white font-bold tracking-tight group-hover:text-vora-accent transition-colors">{n.message}</p>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    </main>
  );
}
