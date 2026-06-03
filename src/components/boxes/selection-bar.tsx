'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HUBBYBOX_WAREHOUSE_LOCATION } from '@/lib/hubbybox-constants';
import type { BoxRow } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface SelectionBarProps {
  isSelectionMode: boolean;
  selectedItemIds: Set<string>;
  box: BoxRow;
  boxId: string;
  isSubmittingRequest: boolean;
  onCancelSelection: () => void;
  onOpenMoveModal: () => void;
}

export function SelectionBar({
  isSelectionMode, selectedItemIds, box, boxId,
  isSubmittingRequest,
  onCancelSelection, onOpenMoveModal,
}: SelectionBarProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isSelectionMode && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50"
        >
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl md:rounded-3xl shadow-2xl flex items-center justify-between">
            <div className="pl-4">
              <p className="text-white font-black">{selectedItemIds.size} รายการ</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">เลือกอยู่</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancelSelection}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all"
              >
                ยกเลิก
              </button>
              {box.location === HUBBYBOX_WAREHOUSE_LOCATION && box.allow_staff_open ? (
                <button
                  onClick={() => {
                    if (selectedItemIds.size > 0)
                      router.push(`/storage/recall?box_id=${boxId}&item_ids=${Array.from(selectedItemIds).join(',')}`);
                  }}
                  disabled={selectedItemIds.size === 0 || isSubmittingRequest}
                  className="px-6 py-3 bg-amber-500 text-white rounded-xl text-sm font-black shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-parachute-box" /> ส่งคืนแยกชิ้น
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (selectedItemIds.size > 0) onOpenMoveModal();
                  }}
                  className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all outline-none"
                >
                  ย้ายไปที่...
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
