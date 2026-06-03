'use client';

import type { BoxRow, ItemRow } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { BOX_STATUS, HUBBYBOX_WAREHOUSE_LOCATION } from '@/lib/hubbybox-constants';

interface BoxStatusCardProps {
  box: BoxRow;
  boxId: string;
  items: ItemRow[];
  isOwner: boolean;
  isLocked: boolean;
  isInWarehouse: boolean;
  isInTransit: boolean;
  isSubmitting: boolean;
  isActionMenuOpen: boolean;
  onSetActionMenuOpen: (v: boolean) => void;
  onSetManualAddOpen: (v: boolean) => void;
  onSetSelectionMode: (v: boolean) => void;
  onSetTrackingModalOpen: (v: boolean) => void;
  onSetTempCarrier: (v: string) => void;
  onSetTempTrackingNumber: (v: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BoxStatusCard({
  box, boxId, items, isOwner, isLocked, isInWarehouse, isInTransit,
  isSubmitting, isActionMenuOpen,
  onSetActionMenuOpen, onSetManualAddOpen, onSetSelectionMode,
  onSetTrackingModalOpen, onSetTempCarrier, onSetTempTrackingNumber,
  onImageUpload, onCoverUpload,
}: BoxStatusCardProps) {
  return (
    <div className={`z-10 backdrop-blur-xl border border-white/80 shadow-sm rounded-2xl p-6 mb-8 flex items-center justify-between relative group ${box?.cover_image_url ? 'bg-slate-900 border-slate-700' : 'bg-gradient-to-br from-white to-sky-50/50'}`}>
        <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none">
          {box?.cover_image_url && (
            <div className="absolute inset-0">
              <img src={box?.cover_image_url} alt="Box Cover" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-slate-900/20"></div>
            </div>
          )}
          <div className={`absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-700 scale-150 ${box?.cover_image_url ? 'text-white' : 'text-sky-500'}`}>
              <i className="fa-solid fa-box-open text-[140px]" aria-hidden="true"></i>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-6">
           <div className="flex flex-col justify-center">
              <p className={`${box?.cover_image_url ? 'text-white/80' : 'text-slate-500'} font-bold text-xs tracking-wide mb-1`}>จำนวนของในกล่อง</p>
              <h2 className={`text-6xl font-bold drop-shadow-sm leading-tight ${box?.cover_image_url ? 'text-white drop-shadow-md' : 'bg-gradient-to-br from-primary to-blue-600 bg-clip-text text-transparent'}`}>{items.length}</h2>
           </div>
        </div>
        
        {/* Box Cover Upload Overlay Button */}
        {isOwner && (
           <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <input type="file" id="cover-image-upload" accept="image/*" className="hidden" onChange={onCoverUpload} disabled={isSubmitting} />
              <label htmlFor="cover-image-upload" className="w-10 h-10 bg-white/20 backdrop-blur-md hover:bg-white/40 border border-white/30 shadow-sm rounded-full flex items-center justify-center cursor-pointer text-white transition-all active:scale-95">
                  <i className="fa-solid fa-camera text-[14px]" aria-hidden="true"></i>
              </label>
           </div>
        )}
        
        {/* FAB Menu */}
        {isOwner && (
             <div className="relative z-30 flex items-center justify-end h-[4.5rem]">
                <div className="relative w-16 h-[4.5rem]">
                   <div className="absolute inset-0 pointer-events-none">
                      {!isLocked && (
                        <>
                          <div className={`absolute top-0 right-0 w-16 h-[4.5rem] transition-all duration-500 ${isActionMenuOpen ? 'translate-y-20 opacity-100 pointer-events-auto' : 'opacity-0 scale-50'}`}>
                            <input type="file" id="camera-capture" accept="image/*" capture="environment" className="hidden" onChange={(e) => { onImageUpload(e); onSetActionMenuOpen(false); }} disabled={isSubmitting} />
                            <label htmlFor="camera-capture" className="w-full h-full bg-white/95 backdrop-blur-md border border-white shadow-xl rounded-xl flex flex-col gap-1 items-center justify-center cursor-pointer text-sky-500 hover:scale-105 active:scale-95 transition-all">
                                <i className="fa-solid fa-camera text-[24px]" aria-hidden="true"></i>
                                <span className="text-[10px] font-bold tracking-wide">ถ่ายรูป</span>
                            </label>
                          </div>
                          <div className={`absolute top-0 right-0 w-16 h-[4.5rem] transition-all duration-500 delay-75 ${isActionMenuOpen ? 'translate-y-40 opacity-100 pointer-events-auto' : 'opacity-0 scale-50'}`}>
                            <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={(e) => { onImageUpload(e); onSetActionMenuOpen(false); }} disabled={isSubmitting} />
                            <label htmlFor="image-upload" className="w-full h-full bg-white/95 backdrop-blur-md border border-white shadow-xl rounded-xl flex flex-col gap-1 items-center justify-center cursor-pointer text-sky-500 hover:scale-105 active:scale-95 transition-all">
                                <i className="fa-regular fa-image text-[24px]" aria-hidden="true"></i>
                                <span className="text-[10px] font-bold tracking-wide">สแกนรูป</span>
                            </label>
                          </div>
                          <div className={`absolute top-0 right-0 w-16 h-[4.5rem] transition-all duration-500 delay-100 ${isActionMenuOpen ? 'translate-y-60 opacity-100 pointer-events-auto' : 'opacity-0 scale-50'}`}>
                            <button onClick={() => { onSetManualAddOpen(true); onSetActionMenuOpen(false); setTimeout(() => document.getElementById('manual-name-input')?.focus(), 100); }} className="w-full h-full bg-white/95 backdrop-blur-md border border-white shadow-xl rounded-xl flex flex-col gap-1 items-center justify-center text-indigo-500 hover:scale-105 active:scale-95 transition-all">
                                <i className="fa-solid fa-pen text-[24px]" aria-hidden="true"></i>
                                <span className="text-[10px] font-bold tracking-wide">จดชื่อ</span>
                            </button>
                          </div>
                        </>
                      )}
                      
                      {isInWarehouse && (
                        <div className={`absolute top-0 right-0 w-16 h-[4.5rem] transition-all duration-500 ${isActionMenuOpen ? 'translate-y-20 opacity-100 pointer-events-auto' : 'opacity-0 scale-50'}`}>
                          <button onClick={() => { onSetSelectionMode(true); onSetActionMenuOpen(false); }} className="w-full h-full bg-slate-900 border border-slate-700 shadow-xl rounded-xl flex flex-col gap-1 items-center justify-center text-amber-400 hover:scale-105 active:scale-95 transition-all">
                              <i className="fa-solid fa-parachute-box text-[24px]" aria-hidden="true"></i>
                              <span className="text-[10px] font-bold tracking-wide">เรียกของคืน</span>
                          </button>
                        </div>
                      )}

                      {isInTransit && (
                        <div className={`absolute top-0 right-0 w-16 h-[4.5rem] transition-all duration-500 ${isActionMenuOpen ? 'translate-y-20 opacity-100 pointer-events-auto' : 'opacity-0 scale-50'}`}>
                          <button
                            onClick={() => {
                              onSetTempCarrier(box.shipping_carrier || '');
                              onSetTempTrackingNumber(box.tracking_number || '');
                              onSetTrackingModalOpen(true);
                              onSetActionMenuOpen(false);
                            }}
                            className="w-full h-full bg-indigo-500 border border-indigo-400 shadow-xl rounded-xl flex flex-col gap-1 items-center justify-center text-white hover:scale-105 active:scale-95 transition-all"
                          >
                              <i className="fa-solid fa-truck-fast text-[24px]" aria-hidden="true"></i>
                              <span className="text-[10px] font-bold tracking-wide">เลขพัสดุ</span>
                          </button>
                        </div>
                      )}
                   </div>
                   <button onClick={() => onSetActionMenuOpen(!isActionMenuOpen)} className={`h-[4.5rem] w-16 border-2 border-white shadow-xl rounded-xl flex items-center justify-center text-white z-40 relative group transition-all ${isLocked ? 'bg-slate-800' : 'bg-gradient-to-br from-primary to-[#2a7aeb]'}`}>
                      {isSubmitting ? <i className="fa-solid fa-spinner fa-spin text-[32px]" aria-hidden="true"></i> : <i className={`fa-solid ${isLocked ? 'fa-ellipsis-vertical' : 'fa-plus'} text-[32px] transition-transform duration-500 ${isActionMenuOpen ? 'rotate-[135deg]' : ''}`} aria-hidden="true"></i>}
                   </button>
                </div>
             </div>
        )}
     </div>
  );
}
