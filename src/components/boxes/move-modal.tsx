'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { BoxRow, ItemRow } from '@/lib/types';

interface MoveModalProps {
  isOpen: boolean;
  isSelectionMode: boolean;
  selectedCount: number;
  itemToMove: ItemRow | null;
  otherBoxes: BoxRow[];
  isLoadingOtherBoxes: boolean;
  onClose: () => void;
  onMoveItem: (targetBoxId: string) => void;
  onMoveBulkItems: (targetBoxId: string) => void;
}

export function MoveModal({
  isOpen, isSelectionMode, selectedCount, itemToMove,
  otherBoxes, isLoadingOtherBoxes,
  onClose, onMoveItem, onMoveBulkItems,
}: MoveModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-white rounded-t-3xl p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800">ย้ายไปกล่องไหนดี?</h3>
                <p className="text-slate-500 font-medium">
                  ย้าย{' '}
                  <span className="text-primary font-bold">
                    {isSelectionMode ? `${selectedCount} รายการ` : `"${itemToMove?.name}"`}
                  </span>{' '}
                  ไปยัง...
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto pr-2">
              {isLoadingOtherBoxes ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <i className="fa-solid fa-spinner fa-spin text-primary text-[32px]" />
                  <p className="text-sm text-slate-400">กำลังค้นหากล่อง...</p>
                </div>
              ) : otherBoxes.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-[2rem]">
                  <p className="text-slate-500 font-bold">ยังไม่มีกล่องอื่นเลย</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pb-4">
                  {otherBoxes.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        if (isSelectionMode) onMoveBulkItems(b.id);
                        else onMoveItem(b.id);
                      }}
                      className="w-full text-left p-5 rounded-2xl bg-slate-50 hover:bg-primary/5 border border-slate-100 hover:border-primary/20 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary shadow-sm transition-colors border border-slate-100">
                          <i className="fa-solid fa-box text-[18px]" />
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">
                          {b.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
