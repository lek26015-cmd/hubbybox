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
          className={`${stat.bg} border ${stat.border} rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color} bg-white shadow-sm border ${stat.border}`}>
            <i className={`fa-solid ${stat.icon} text-[14px]`} aria-hidden="true" />
          </div>
          <span className={`text-2xl font-black tabular-nums ${stat.color}`}>
            {stat.value !== null ? stat.value : (
              <i className="fa-solid fa-spinner fa-spin text-[16px] opacity-40" />
            )}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">
            {stat.label}
          </span>
        </div>
      ))}
    </section>
  );
}
