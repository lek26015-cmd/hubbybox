'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HUBBYBOX_WAREHOUSE_LOCATION, BOX_STATUS } from '@/lib/hubbybox-constants';
import Link from 'next/link';

type RecentBoxActivity = {
  id: string;
  name: string;
  status: string | null;
  created_at: string;
  user_id: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    boxes: 0,
    items: 0,
    inbound: 0,
  });
  const [activities, setActivities] = useState<RecentBoxActivity[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [
          { count: userCount },
          { count: boxCount },
          { count: itemCount },
          { count: inboundCount },
        ] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('boxes').select('*', { count: 'exact', head: true }),
          supabase.from('items').select('*', { count: 'exact', head: true }),
          supabase
            .from('boxes')
            .select('*', { count: 'exact', head: true })
            .eq('location', HUBBYBOX_WAREHOUSE_LOCATION)
            .eq('status', BOX_STATUS.SHIPPING_TO_WAREHOUSE),
        ]);
        
        setStats({
          users: userCount || 0,
          boxes: boxCount || 0,
          items: itemCount || 0,
          inbound: inboundCount || 0,
        });

        const { data: recentBoxes } = await supabase
          .from('boxes')
          .select('id, name, status, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(5);
        
        setActivities((recentBoxes as RecentBoxActivity[]) || []);
      } catch (err) {
        console.error('Failed to fetch admin dashboard data:', err);
      }
    }
    fetchDashboardData();
  }, []);

   return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 flex flex-col 2xl:flex-row gap-6 lg:gap-10">
      {/* Middle Section (Content) */}
      <div className="flex-1 space-y-6 lg:space-y-10 pb-12">
         {/* Stats Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCard label="Total Users" value={stats.users} trend="+12.4%" icon="fa-users" color="text-vora-accent" />
            <StatCard label="Boxes Stored" value={stats.boxes} trend="+8.2%" icon="fa-boxes-stacked" color="text-sky-500" />
            <StatCard label="Total Items" value={stats.items} trend="+5.1%" icon="fa-gem" color="text-indigo-500" />
            <StatCard label="รอรับเข้าคลัง" value={stats.inbound} trend="Live" icon="fa-parachute-box" color="text-emerald-500" />
         </div>

         {/* Large Trend Card */}
         <div className="bg-admin-card border border-admin-border rounded-2xl p-6 lg:p-10 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
               <div>
                  <h3 className="text-xl lg:text-2xl font-black text-admin-text-primary mb-1 tracking-tight">System Growth</h3>
                  <p className="text-slate-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest leading-relaxed">Activity patterns across nodes</p>
               </div>
               <div className="p-1 bg-slate-50 rounded-xl flex gap-1 border border-admin-border w-full lg:w-auto overflow-x-auto">
                  <PeriodTab label="Daily" active />
                  <PeriodTab label="Weekly" />
                  <PeriodTab label="Monthly" />
               </div>
            </div>
            
            {/* Mock Chart Area */}
            <div className="h-48 lg:h-64 flex items-end gap-1.5 lg:gap-3 px-2 lg:px-4 relative">
               {[45, 60, 35, 70, 85, 55, 90, 75, 40, 65, 80, 50].map((h, i) => (
                  <div key={i} className="flex-1 bg-slate-100 rounded-t-lg relative overflow-hidden group/bar">
                     <div 
                        className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-1000 ${i === 6 ? 'bg-vora-accent shadow-[0_0_20px_rgba(52,137,255,0.2)]' : 'bg-vora-accent/20 group-hover/bar:bg-vora-accent/40'}`} 
                        style={{ height: `${h}%` }}
                     ></div>
                  </div>
               ))}
            </div>

            <div className="mt-8 lg:mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 sm:gap-4">
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-10 w-full sm:w-auto">
                  <div>
                     <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Growth Rate</p>
                     <h4 className="text-2xl lg:text-3xl font-black text-admin-text-primary flex items-center gap-2">0,45% <span className="text-emerald-500 text-xs"><i className="fa-solid fa-caret-up"></i></span></h4>
                  </div>
                  <div className="h-px sm:h-8 w-full sm:w-px bg-admin-border"></div>
                  <div>
                     <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Revenue</p>
                     <h4 className="text-2xl lg:text-3xl font-black text-admin-text-primary">$563,443</h4>
                  </div>
               </div>
               <div className="w-full sm:w-auto text-left sm:text-right">
                  <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">System Load</p>
                  <div className="w-full sm:w-48 h-2 bg-slate-100 rounded-full overflow-hidden border border-admin-border">
                     <div className="w-4/5 h-full bg-vora-accent"></div>
                  </div>
               </div>
            </div>
         </div>

         {/* Activity Section - COMPACT TABLE */}
         <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-admin-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
               <h4 className="font-black text-lg text-admin-text-primary">กิจกรรมกล่องล่าสุด</h4>
               <div className="flex flex-wrap gap-3">
                  <Link href="/admin_site/warehouse" className="text-vora-accent font-black text-[10px] uppercase tracking-widest hover:underline">View All Warehouse</Link>
               </div>
            </div>
            
            <div className="overflow-x-auto">
               {activities.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm font-medium py-12">ยังไม่มีข้อมูลกล่อง</p>
               ) : (
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50/50 border-b border-admin-border text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                           <th className="px-8 py-4">Activity</th>
                           <th className="px-8 py-4">User</th>
                           <th className="px-8 py-4">Status</th>
                           <th className="px-8 py-4 text-right">Date</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-admin-border">
                        {activities.map((a) => (
                           <tr key={a.id} className="group hover:bg-slate-50 transition-colors">
                              <td className="px-8 py-3.5">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-vora-accent group-hover:scale-110 transition-transform">
                                       <i className={`fa-solid ${
                                         a.status === 'returning'
                                           ? 'fa-truck-arrow-right'
                                           : a.status === BOX_STATUS.SHIPPING_TO_WAREHOUSE
                                             ? 'fa-parachute-box'
                                             : 'fa-box-open'
                                       } text-xs`}></i>
                                    </div>
                                    <p className="font-bold text-admin-text-primary text-xs">กล่อง: {a.name}</p>
                                 </div>
                              </td>
                              <td className="px-8 py-3.5">
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    User: {(a.user_id || '').slice(0, 8) || '—'}…
                                 </span>
                              </td>
                              <td className="px-8 py-3.5">
                                 <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                                    a.status === 'returning' ? 'bg-amber-100 text-amber-700' : 
                                    a.status === BOX_STATUS.SHIPPING_TO_WAREHOUSE ? 'bg-sky-100 text-sky-700' : 
                                    'bg-emerald-100 text-emerald-700'
                                 }`}>
                                    {a.status || 'Verified'}
                                 </span>
                              </td>
                              <td className="px-8 py-3.5 text-right">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    {new Date(a.created_at).toLocaleDateString('th-TH')}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
         </div>
      </div>

      {/* Right Section (Side Panel) */}
      <aside className="w-full 2xl:w-96 space-y-6 lg:space-y-8 h-fit 2xl:h-full">
         <div className="bg-admin-card border border-admin-border rounded-2xl p-6 lg:p-10 h-full shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <h4 className="text-xl font-black text-admin-text-primary">Quick To-Do</h4>
               <Link href="/admin_site/tasks/new" className="w-10 h-10 bg-vora-accent rounded-xl flex items-center justify-center text-white shadow-xl shadow-vora-accent/20 active:scale-95 transition-all">
                  <i className="fa-solid fa-plus text-sm"></i>
               </Link>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-10">Recommended Tasks</p>
            
            <div className="space-y-10">
               <TaskItem 
                  category="Inventory" 
                  title="Check incoming boxes — App deposit" 
                  progress={stats.inbound > 0 ? 40 : 100} 
                  color="bg-primary" 
                  avatars={['WH']}
               />
               <TaskItem 
                  category="Customer" 
                  title="Follow up Hubby Supplies orders" 
                  progress={55} 
                  color="bg-emerald-500" 
                  avatars={['S']}
               />
               <TaskItem 
                  category="System" 
                  title="Verify new user quotas" 
                  progress={20} 
                  color="bg-amber-500" 
                  avatars={['IT']}
               />
            </div>

            <div className="mt-20 pt-10 border-t border-admin-border">
               <div className="bg-slate-50 rounded-2xl p-8 border border-admin-border relative overflow-hidden">
                  <h5 className="font-black text-admin-text-primary mb-2 relative z-10">Server Node Status</h5>
                  <div className="flex items-center gap-3 relative z-10">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active & Stable</span>
                  </div>
               </div>
            </div>
         </div>
      </aside>
    </main>
  );
}

// Sub-components (StatCard, PeriodTab, TaskItem stay here for local usage, NavItem moved to layout)
function StatCard({ label, value, trend, icon, color }: { label: string, value: string | number, trend: string, icon: string, color: string }) {
   return (
      <div className="bg-white border border-admin-border p-8 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all shadow-sm ring-4 ring-slate-400/[0.01]">
         <div className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 ${color}`}>
            <i className={`fa-solid ${icon} text-9xl`}></i>
         </div>
         <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   {label}
                   <div className={`w-1 h-1 rounded-full ${color.replace('text-', 'bg-')}`}></div>
                </div>
               <h3 className="text-4xl font-black text-admin-text-primary tracking-tighter mb-2">{value}</h3>
            </div>
            <div className="flex items-center gap-2 mt-4">
               <span className={`${trend === 'Live' ? 'text-emerald-500' : 'text-vora-accent'} text-[10px] font-black uppercase tracking-wider`}>{trend}</span>
               <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest leading-none">Database</span>
            </div>
         </div>
      </div>
   );
}

function PeriodTab({ label, active = false }: { label: string, active?: boolean }) {
   return (
      <button type="button" className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-admin-text-primary shadow-sm border border-admin-border' : 'text-slate-400 hover:text-slate-600'}`}>
         {label}
      </button>
   );
}

function TaskItem({ category, title, progress, color, avatars }: { category: string, title: string, progress: number, color: string, avatars: string[] }) {
   return (
      <div className="space-y-4 group">
         <div className={`px-3 py-1 rounded-md ${color} text-white font-black text-[9px] uppercase tracking-widest w-fit shadow-lg shadow-current/20`}>{category}</div>
         <h5 className="text-admin-text-primary font-bold leading-relaxed group-hover:text-vora-accent transition-colors">{title}</h5>
         <div className="flex items-center gap-4">
            <div className="flex -space-x-2 overflow-hidden">
               {avatars.map((a, i) => (
                  <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-admin-card bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 border border-admin-border">{a}</div>
               ))}
            </div>
            <div className="flex-1 space-y-1.5">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Status</span>
                  <span className="text-slate-900">{progress}%</span>
               </div>
               <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-admin-border">
                  <div className={`h-full ${color}`} style={{ width: `${progress}%` }}></div>
               </div>
            </div>
         </div>
      </div>
   );
}
