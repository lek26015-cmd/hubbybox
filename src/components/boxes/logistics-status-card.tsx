'use client';

import type { BoxRow } from '@/lib/types';
import { HUBBYBOX_WAREHOUSE_LOCATION, BOX_STATUS } from '@/lib/hubbybox-constants';
import { useRouter } from 'next/navigation';

interface LogisticsStatusCardProps {
  box: BoxRow;
  boxId: string;
  isOwner: boolean;
  isInWarehouse: boolean;
  isInTransit: boolean;
  isSubmittingRequest: boolean;
  onToggleStaffOpen: () => void;
  onOpenTrackingModal: (carrier: string, tracking: string) => void;
}

export function LogisticsStatusCard({
  box, boxId, isOwner, isInWarehouse, isInTransit,
  isSubmittingRequest,
  onToggleStaffOpen, onOpenTrackingModal,
}: LogisticsStatusCardProps) {
  const router = useRouter();

  if (!isOwner) return null;

  return (
    <div className="mb-8 space-y-4">
      {/* Current Status */}
      <div className="beam-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                box.location === HUBBYBOX_WAREHOUSE_LOCATION
                  ? 'bg-indigo-50 text-indigo-500'
                  : 'bg-emerald-50 text-emerald-500'
              }`}
            >
              <i
                className={`fa-solid ${box.location === HUBBYBOX_WAREHOUSE_LOCATION ? 'fa-warehouse' : 'fa-house-user'}`}
                aria-hidden="true"
              />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">สถานะปัจจุบัน</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                Current Status
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
              box.status === 'returning'
                ? 'bg-amber-100 text-amber-600 border-amber-200'
                : box.status === BOX_STATUS.SHIPPING_TO_WAREHOUSE
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : box.location === HUBBYBOX_WAREHOUSE_LOCATION
                    ? 'bg-indigo-100 text-indigo-600 border-indigo-200'
                    : 'bg-emerald-100 text-emerald-600 border-emerald-200'
            }`}
          >
            {box.status === 'returning'
              ? 'กำลังส่งคืน'
              : box.status === BOX_STATUS.SHIPPING_TO_WAREHOUSE
                ? 'กำลังนำส่งเข้าคลัง'
                : box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION)
                  ? 'อยู่ในคลัง'
                  : 'อยู่ที่บ้าน'}
          </span>
        </div>

        {/* Shipping Info */}
        {(box.shipping_carrier || isInTransit) && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ผู้ขนส่ง</span>
              <p className="text-sm font-bold text-slate-700">{box.shipping_carrier || 'ยังไม่ได้ระบุ'}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">เลขพัสดุ</span>
              {box.tracking_number ? (
                <p className="text-sm font-black text-primary tracking-tight">{box.tracking_number}</p>
              ) : (
                <button
                  onClick={() => onOpenTrackingModal(box.shipping_carrier || '', '')}
                  className="text-[10px] font-bold text-sky-500 underline"
                >
                  เพิ่มเลขพัสดุ
                </button>
              )}
            </div>
          </div>
        )}

        {isInTransit && box.shipping_carrier && (
          <button
            onClick={() => onOpenTrackingModal(box.shipping_carrier || '', box.tracking_number || '')}
            className="w-full mt-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all"
          >
            แก้ไขข้อมูลการจัดส่ง
          </button>
        )}
      </div>

      {/* Warehouse Management Card */}
      {box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION) &&
        box.status !== 'returning' &&
        box.status !== BOX_STATUS.SHIPPING_TO_WAREHOUSE && (
          <div className="bg-[#171A1C] text-white p-6 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
              <i className="fa-solid fa-parachute-box text-[60px]" aria-hidden="true" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-lg">การจัดการกล่องในคลัง</h4>
                <i className="fa-solid fa-shield-check text-sky-400" aria-hidden="true" />
              </div>
              <p className="text-xs text-white/60 font-medium leading-relaxed">
                คุณสามารถเรียกคืนทั้งกล่อง หรืออนุญาตให้เจ้าหน้าที่เปิดเพื่อส่งของคืนแยกชิ้นได้
              </p>
            </div>
            <div className="flex flex-col gap-3 relative z-10">
              <button
                onClick={onToggleStaffOpen}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  box.allow_staff_open
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                    : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className={`fa-solid ${box.allow_staff_open ? 'fa-unlock' : 'fa-lock'} text-lg`} aria-hidden="true" />
                  <div className="text-left">
                    <span className="block text-sm font-bold">อนุญาตให้เจ้าหน้าที่เปิด</span>
                    <span className="block text-[9px] font-black uppercase tracking-widest opacity-60">
                      Staff Open Permission
                    </span>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${box.allow_staff_open ? 'bg-sky-500' : 'bg-white/20'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${box.allow_staff_open ? 'left-5' : 'left-1'}`} />
                </div>
              </button>
              <button
                onClick={() => router.push(`/storage/recall?box_id=${boxId}`)}
                disabled={isSubmittingRequest}
                className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <i className="fa-solid fa-arrow-rotate-left" aria-hidden="true" /> เรียกคืนกล่องนี้กลับบ้าน
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
