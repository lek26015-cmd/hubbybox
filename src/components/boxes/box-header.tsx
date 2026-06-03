'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { BoxRow } from '@/lib/types';
import { HUBBYBOX_WAREHOUSE_LOCATION } from '@/lib/hubbybox-constants';
import { useConfirm } from '@/components/ui/confirm-modal';

interface BoxHeaderProps {
  box: BoxRow;
  boxId: string;
  isOwner: boolean;
  isLocked: boolean;
  isEditingBoxName: boolean;
  editedBoxName: string;
  onEditBoxName: () => void;
  onCancelEditBoxName: () => void;
  onSaveBoxName: () => void;
  onEditBoxNameChange: (val: string) => void;
  onPatchBox: (updates: Record<string, unknown>) => Promise<unknown>;
  onSetBox: (box: BoxRow) => void;
  toast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export function BoxHeader({
  box, boxId, isOwner, isLocked,
  isEditingBoxName, editedBoxName,
  onEditBoxName, onCancelEditBoxName, onSaveBoxName, onEditBoxNameChange,
  onPatchBox, onSetBox, toast,
}: BoxHeaderProps) {
  const { prompt } = useConfirm();

  const handleLocationEdit = async () => {
    if (!isOwner || isLocked) return;
    if (box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION)) {
      const newLoc = await prompt('เปลี่ยนพิกัด', 'ย้ายกลับมาที่บ้าน? ระบุพิกัด (เช่น ห้องพระ) หรือปล่อยว่างเพื่อใช้ "ที่บ้าน"', 'ที่บ้าน');
      if (newLoc !== null) {
        try { await onPatchBox({ location: newLoc || 'ที่บ้าน' }); onSetBox({ ...box, location: newLoc || 'ที่บ้าน' }); } catch { /* ignore */ }
      }
    } else {
      const newLoc = await prompt('เปลี่ยนพิกัด', 'ระบุพิกัดที่เก็บในบ้าน', box.location ?? '');
      if (newLoc !== null) {
        try { await onPatchBox({ location: newLoc || 'ที่บ้าน' }); onSetBox({ ...box, location: newLoc || 'ที่บ้าน' }); } catch { /* ignore */ }
      }
    }
  };

  return (
    <header className="print:hidden sticky top-0 z-20 bg-white/70 backdrop-blur-2xl border-b border-white/50 px-6 py-4 flex items-center justify-between shadow-sm">
      <Link href="/" className="w-11 h-11 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-600 active:scale-90 transition-all hover:bg-slate-50 hover:text-sky-500">
         <i className="fa-solid fa-arrow-left text-[20px]" aria-hidden="true"></i>
      </Link>
      <div className="flex items-center gap-3 flex-1 px-4 justify-center">
          <div className="w-10 h-10 overflow-hidden shrink-0">
             <Image src="/hubbybox-icon.png" alt="HubbyBox" width={40} height={40} className="object-contain w-full h-full" />
          </div>
          <div className="flex flex-col items-center">
            {isEditingBoxName && isOwner ? (
              <input
                type="text"
                value={editedBoxName}
                onChange={(e) => onEditBoxNameChange(e.target.value)}
                onBlur={onSaveBoxName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveBoxName();
                  if (e.key === 'Escape') onCancelEditBoxName();
                }}
                autoFocus
                className="bg-primary/5 border-b-2 border-primary focus:outline-none font-bold text-xl text-slate-800 w-full max-w-[200px] px-1 animate-pulse text-center"
              />
            ) : (
              <div
                onClick={() => { if (isOwner) onEditBoxName(); }}
                className={`flex items-center gap-2 ${isOwner ? 'cursor-pointer group' : ''}`}
              >
                <span className="font-bold text-xl text-slate-800 line-clamp-1">{box?.name}</span>
                {isOwner && !isLocked && <i className="fa-solid fa-pen text-[12px] text-slate-300 group-hover:text-sky-400" aria-hidden="true"></i>}
              </div>
            )}

            {/* Location Badge */}
            <button
              onClick={handleLocationEdit}
              className={`mt-0.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all ${
                box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION)
                  ? 'bg-indigo-500 text-white border-indigo-400'
                  : 'bg-white text-slate-400 border-slate-200 hover:border-sky-300 hover:text-sky-500'
              }`}
            >
              <i className={`fa-solid ${box.location === HUBBYBOX_WAREHOUSE_LOCATION ? 'fa-warehouse' : 'fa-location-dot'}`} aria-hidden="true"></i>
              {box.location || 'ที่บ้าน'}
              {!isLocked && isOwner && <i className="fa-solid fa-chevron-right text-[8px] ml-1 opacity-40" aria-hidden="true"></i>}
            </button>
          </div>
      </div>
      {isOwner ? (
        <div className="flex gap-1">
          {box.location !== HUBBYBOX_WAREHOUSE_LOCATION && (
            <button
              onClick={() => { toast('คลังสินค้าของเรากำลังก่อสร้างและเตรียมระบบ ขออภัยในความไม่สะดวกครับ (Coming Soon)', 'info'); }}
              className="w-11 h-11 bg-slate-100 text-slate-300 shadow-sm rounded-full flex items-center justify-center relative group cursor-not-allowed"
              title="ส่งเข้าคลังกลาง (เร็วๆ นี้)"
            >
               <i className="fa-solid fa-parachute-box text-[20px]" aria-hidden="true"></i>
               <div className="absolute top-12 -right-2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">เร็วๆ นี้</div>
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="w-11 h-11 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-600 active:scale-90 transition-all hover:bg-slate-50 hover:text-sky-500 relative group"
            title="ปริ้นท์ QR โค้ด"
          >
             <i className="fa-solid fa-qrcode text-[20px]" aria-hidden="true"></i>
             <div className="absolute top-12 -right-2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">ปริ้นท์ QR</div>
          </button>
        </div>
      ) : (
        <div className="w-11"></div>
      )}
    </header>
  );
}
