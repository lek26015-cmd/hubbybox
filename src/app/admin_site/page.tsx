'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    boxes: 0,
    items: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: boxCount } = await supabase.from('boxes').select('*', { count: 'exact', head: true });
        const { count: itemCount } = await supabase.from('items').select('*', { count: 'exact', head: true });
        
        setStats({
          users: userCount || 0,
          boxes: boxCount || 0,
          items: itemCount || 0,
        });

        // Fetch Recent Activity
        const { data: recentBoxes } = await supabase
          .from('boxes')
          .select('id, name, status, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(5);
        
        setActivities(recentBoxes || []);
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
            <StatCard label="Total Users" value={stats.users} change="+12.4%" icon="fa-users" />
            <StatCard label="Boxes Stored" value={stats.boxes} change="+8.2%" icon="fa-boxes-stacked" accent />
            <StatCard label="Total Items" value={stats.items} change="+5.1%" icon="fa-gem" />
            <StatCard label="New Requests" value="12" change="+2" icon="fa-bell" />
         </div>

         {/* Large Trend Card */}
         <div className="bg-vora-card border border-white/5 rounded-2xl p-6 lg:p-10 relative overflow-hidden group">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
               <div>
                  <h3 className="text-xl lg:text-2xl font-black text-white mb-1">Project Created</h3>
                  <p className="text-slate-500 text-[10px] lg:text-xs font-bold uppercase tracking-widest leading-relaxed">System-wide activity trends</p>
               </div>
               <div className="p-1 bg-vora-dark rounded-xl flex gap-1 border border-white/5 w-full lg:w-auto overflow-x-auto">
                  <PeriodTab label="Daily" active />
                  <PeriodTab label="Weekly" />
                  <PeriodTab label="Monthly" />
               </div>
            </div>
            
            {/* Mock Chart Area */}
            <div className="h-48 lg:h-64 flex items-end gap-1.5 lg:gap-3 px-2 lg:px-4 relative">
               {[45, 60, 35, 70, 85, 55, 90, 75, 40, 65, 80, 50].map((h, i) => (
                  <div key={i} className="flex-1 bg-vora-dark rounded-t-lg relative overflow-hidden group/bar">
                     <div 
                        className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-1000 ${i === 6 ? 'bg-vora-accent shadow-[0_0_30px_#3489ff44]' : 'bg-vora-accent/10 group-hover/bar:bg-vora-accent/30'}`} 
                        style={{ height: `${h}%` }}
                     ></div>
                  </div>
               ))}
            </div>

            <div className="mt-8 lg:mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 sm:gap-4">
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-10 w-full sm:w-auto">
                  <div>
                     <p className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Growth Rate</p>
                     <h4 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-2">0,45% <span className="text-emerald-500 text-xs"><i className="fa-notdog fa-solid fa-caret-up"></i></span></h4>
                  </div>
                  <div className="h-px sm:h-8 w-full sm:w-px bg-white/5"></div>
                  <div>
                     <p className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Monthly Revenue</p>
                     <h4 className="text-2xl lg:text-3xl font-black text-white">$563,443</h4>
                  </div>
               </div>
               <div className="w-full sm:w-auto text-left sm:text-right">
                  <p className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">System Load</p>
                  <div className="w-full sm:w-48 h-2 bg-vora-dark rounded-full overflow-hidden border border-white/5">
                     <div className="w-4/5 h-full bg-vora-accent shadow-[0_0_10px_#3489ff88]"></div>
                  </div>
               </div>
            </div>
         </div>

         {/* Activity Section Placeholder */}
         <div className="bg-vora-card border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
               <h4 className="font-black text-xl text-white">Recent Distribution Activity</h4>
               <Link href="/admin_site/logs" className="text-vora-accent font-black text-xs uppercase tracking-widest hover:underline">View All Logs</Link>
            </div>
            <div className="p-4">
               {activities.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-6 hover:bg-white/5 rounded-xl transition-all group">
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-vora-dark flex items-center justify-center text-vora-accent group-hover:scale-110 transition-transform">
                           <i className={`fa-notdog fa-solid ${a.status === 'returning' ? 'fa-truck-arrow-right' : 'fa-box-open'}`}></i>
                        </div>
                        <div>
                           <p className="font-black text-white text-sm">Box: {a.name}</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{a.status || 'Verified'} • User ID: {a.user_id.substring(0, 6)}...</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-slate-700 uppercase">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Right Section (Side Panel) */}
      <aside className="w-full 2xl:w-96 space-y-6 lg:space-y-8 h-fit 2xl:h-full">
         <div className="bg-vora-card border border-white/5 rounded-2xl p-6 lg:p-10 h-full shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <h4 className="text-xl font-black text-white">Quick To-Do List</h4>
               <Link href="/admin_site/tasks/new" className="w-10 h-10 bg-vora-accent rounded-xl flex items-center justify-center text-white shadow-xl shadow-vora-accent/20 active:scale-95 transition-all">
                  <i className="fa-notdog fa-solid fa-plus text-sm"></i>
               </Link>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-10">งานแนะนำสำหรับเจ้าหน้าที่</p>
            
            <div className="space-y-10">
               <TaskItem 
                  category="Logistics" 
                  title="Build Database Design for Fasto Admin v2" 
                  progress={79} 
                  color="bg-primary" 
                  avatars={['A', 'B', 'C']}
               />
               <TaskItem 
                  category="Warehouse" 
                  title="Visual Graphic for Presentation to Client" 
                  progress={24} 
                  color="bg-emerald-500" 
                  avatars={['D', 'E']}
               />
               <TaskItem 
                  category="Maintenance" 
                  title="Make Promotional Ads for Instagram Fasto's" 
                  progress={36} 
                  color="bg-amber-500" 
                  avatars={['F', 'G', 'H']}
               />
            </div>

            <div className="mt-20 pt-10 border-t border-white/5">
               <div className="bg-vora-dark rounded-2xl p-8 border border-white/5 relative overflow-hidden">
                  <div className="absolute -left-4 -top-4 opacity-5 rotate-12">
                     <i className="fa-notdog fa-solid fa-circle-nodes text-[120px]"></i>
                  </div>
                  <h5 className="font-black text-white mb-2 relative z-10">Server Status</h5>
                  <div className="flex items-center gap-3 relative z-10">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Running Smooth</span>
                  </div>
               </div>
            </div>
         </div>
      </aside>
    </main>
  );
}

// Sub-components (StatCard, PeriodTab, TaskItem stay here for local usage, NavItem moved to layout)
function StatCard({ label, value, change, icon, accent = false }: { label: string, value: any, change: string, icon: string, accent?: boolean }) {
   return (
      <div className="bg-vora-card border border-white/5 p-8 rounded-2xl relative overflow-hidden group hover:border-vora-accent/20 transition-all shadow-lg hover:shadow-2xl">
         <div className={`absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-all duration-700 font-black ${accent ? 'text-vora-accent' : 'text-slate-700'} text-7xl`}>
            <i className={`fa-notdog fa-solid ${icon}`}></i>
         </div>
         <p className="text-slate-600 font-extrabold text-[9px] uppercase tracking-[0.2em] mb-4">{label}</p>
         <h3 className="text-5xl font-black text-white tracking-tighter mb-4">{value}</h3>
         <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Status: <span className="text-emerald-500">+{change}</span>
         </div>
      </div>
   );
}

function PeriodTab({ label, active = false }: { label: string, active?: boolean }) {
   return (
      <button className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-vora-accent text-white shadow-xl shadow-vora-accent/20' : 'text-slate-600 hover:text-slate-300'}`}>
         {label}
      </button>
   );
}

function TaskItem({ category, title, progress, color, avatars }: { category: string, title: string, progress: number, color: string, avatars: string[] }) {
   return (
      <div className="space-y-4 group">
         <div className={`px-3 py-1 rounded-md ${color} text-white font-black text-[9px] uppercase tracking-widest w-fit shadow-lg shadow-current/20`}>{category}</div>
         <h5 className="text-white font-bold leading-relaxed group-hover:text-vora-accent transition-colors">{title}</h5>
         <div className="flex items-center gap-4">
            <div className="flex -space-x-2 overflow-hidden">
               {avatars.map((a, i) => (
                  <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-vora-card bg-slate-700 flex items-center justify-center text-[10px] font-black text-white">{a}</div>
               ))}
            </div>
            <div className="flex-1 space-y-1.5">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-600">Progress</span>
                  <span className="text-white">{progress}%</span>
               </div>
               <div className="w-full h-1.5 bg-vora-dark rounded-full overflow-hidden border border-white/5">
                  <div className={`h-full ${color} shadow-[0_0_10px_currentColor]`} style={{ width: `${progress}%` }}></div>
               </div>
            </div>
         </div>
      </div>
   );
}
