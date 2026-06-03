'use client';

import type { BoxRow } from '@/lib/types';
import { HUBBYBOX_WAREHOUSE_LOCATION, BOX_STATUS } from '@/lib/hubbybox-constants';

interface LogisticsStepperProps {
  box: BoxRow;
}

export function LogisticsStepper({ box }: LogisticsStepperProps) {
  if (box.location === 'ที่บ้าน' || box.location === null) return null;

  const steps = [
    { label: 'กำลังนำส่ง', icon: 'fa-truck-fast' },
    { label: 'ถึงคลังแล้ว', icon: 'fa-warehouse' },
    { label: 'จัดเก็บเรียบร้อย', icon: 'fa-circle-check' },
  ];

  return (
    <div className="mb-8 px-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-primary transition-all duration-1000"
            style={{
              width: box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION)
                ? box.location?.includes('Zone') ? '100%' : '50%'
                : '0%',
            }}
          />
        </div>
        {steps.map((step, idx) => {
          const isActive =
            (idx === 0 && box.status === BOX_STATUS.SHIPPING_TO_WAREHOUSE) ||
            (idx === 1 && box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION) && !box.allow_staff_open) ||
            (idx === 2 && box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION) && box.allow_staff_open);
          const isCompleted =
            (idx === 0 && box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION)) ||
            (idx === 1 && box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION) && box.allow_staff_open);

          return (
            <div key={idx} className="flex flex-col items-center gap-2 relative z-10 w-20">
              <div
                className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                  isActive
                    ? 'bg-primary border-primary/20 text-white shadow-lg shadow-primary/20 scale-110'
                    : isCompleted
                      ? 'bg-primary border-primary text-white scale-100'
                      : 'bg-white border-slate-100 text-slate-300'
                }`}
              >
                <i className={`fa-solid ${isCompleted ? 'fa-check' : step.icon} text-sm`} aria-hidden="true" />
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-widest text-center leading-tight ${
                  isActive || isCompleted ? 'text-slate-800' : 'text-slate-300'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
