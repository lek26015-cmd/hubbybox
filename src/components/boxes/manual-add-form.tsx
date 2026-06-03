'use client';

import { motion } from 'framer-motion';

interface ManualAddFormProps {
  newItemName: string;
  isSubmitting: boolean;
  isLocked: boolean;
  onSetNewItemName: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function ManualAddForm({
  newItemName, isSubmitting, isLocked,
  onSetNewItemName, onSubmit, onClose,
}: ManualAddFormProps) {
  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10 relative">
      <form
        onSubmit={(e) => {
          onSubmit(e);
          onClose();
        }}
        className="relative flex flex-col gap-4"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-2 w-8 h-8 bg-slate-100 border border-white rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 shadow-sm z-10 transition-colors"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
        <div className="flex bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl border-2 border-white shadow-xl overflow-hidden group focus-within:ring-4 ring-primary/10 transition-all opacity-95">
          <input
            id="manual-name-input"
            type="text"
            value={newItemName}
            onChange={(e) => onSetNewItemName(e.target.value)}
            placeholder={isLocked ? 'ไม่รองรับการจดชื่อขณะอยู่ในคลัง' : 'จดชื่อของเพิ่มเติม...'}
            disabled={!!isLocked}
            className="w-full bg-transparent py-5 pl-6 pr-4 text-slate-800 text-lg font-bold focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newItemName.trim() || isSubmitting || !!isLocked}
            className="w-[88px] bg-primary hover:bg-primary/90 disabled:bg-slate-100 text-white flex items-center justify-center transition-all"
          >
            <i className="fa-solid fa-plus text-[28px]" aria-hidden="true" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
