'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { HUBBYBOX_WAREHOUSE_LOCATION } from '@/lib/hubbybox-constants';
import type { BoxListRow } from '@/lib/box-types';

interface LandingStatsProps {
  boxes: BoxListRow[];
  dbUserId?: string;
}

export function LandingStats({ boxes, dbUserId }: LandingStatsProps) {
  const [totalItems, setTotalItems] = useState<number | null>(null);

  useEffect(() => {
    if (!dbUserId) return;
    async function fetchItemCount() {
      const { count } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .in('box_id', boxes.map((b) => b.id));
      setTotalItems(count ?? 0);
    }
    if (boxes.length > 0) fetchItemCount();
    else setTotalItems(0);
  }, [boxes, dbUserId]);

  const warehouseCount = boxes.filter((b) =>
    b.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION)
  ).length;

  const stats = [
    {
      icon: 'fa-box',
      label: 'กล่องทั้งหมด',
      value: boxes.length,
      color: 'text-sky-500',
      bg: 'bg-sky-50',
      border: 'border-sky-100',
    },
    {
      icon: 'fa-tags',
      label: 'ของทั้งหมด',
      value: totalItems,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
    {
      icon: 'fa-warehouse',
      label: 'อยู่ในคลัง',
      value: warehouseCount,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
  ];

  return (
    <section className="mb-6 grid grid-cols-3 gap-3">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`${stat.bg} border ${stat.border} rounded-[16px] py-2 px-3 flex flex-row items-center gap-2.5 shadow-sm opacity-90`}
        >
          <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${stat.color} bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border ${stat.border}`}>
            <i className={`fa-solid ${stat.icon} text-[11px]`} aria-hidden="true" />
          </div>
          <div className="flex flex-col min-w-0">
             <span className={`text-base font-black tabular-nums leading-none mb-0.5 ${stat.color}`}>
               {stat.value !== null ? stat.value : (
                 <i className="fa-solid fa-spinner fa-spin text-[12px] opacity-40" />
               )}
             </span>
             <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none truncate">
               {stat.label}
             </span>
          </div>
        </div>
      ))}
    </section>
  );
}
