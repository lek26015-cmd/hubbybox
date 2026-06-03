'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface TrackingModalProps {
  isOpen: boolean;
  tempCarrier: string;
  tempTrackingNumber: string;
  isSubmittingRequest: boolean;
  onSetTempCarrier: (v: string) => void;
  onSetTempTrackingNumber: (v: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function TrackingModal({
  isOpen, tempCarrier, tempTrackingNumber, isSubmittingRequest,
  onSetTempCarrier, onSetTempTrackingNumber,
  onClose, onSubmit,
}: TrackingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-white rounded-t-[2.5rem] p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800">ระบุเลขพัสดุ</h3>
                <p className="text-slate-500 font-medium text-sm">
                  ช่วยให้ทีมงานตรวจสอบและรับของได้รวดเร็วขึ้นครับ
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  ผู้ให้บริการขนส่ง
                </label>
                <select
                  value={tempCarrier}
                  onChange={(e) => onSetTempCarrier(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 font-bold text-slate-700 focus:border-primary/30 focus:outline-none transition-all appearance-none"
                >
                  <option value="">-- เลือกผู้ให้บริการ --</option>
                  <option value="Flash">Flash Express</option>
                  <option value="J&T">J&T Express</option>
                  <option value="Kerry">Kerry Express</option>
                  <option value="ThaiPost">ไปรษณีย์ไทย (EMS)</option>
                  <option value="Other">อื่นๆ (มาส่งเอง / Lalamove)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  เลขพัสดุ (Tracking Number)
                </label>
                <input
                  type="text"
                  value={tempTrackingNumber}
                  onChange={(e) => onSetTempTrackingNumber(e.target.value)}
                  placeholder="เช่น TH12345678"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 font-bold text-slate-700 placeholder-slate-300 focus:border-primary/30 focus:outline-none transition-all"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl active:scale-95 transition-all text-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!tempCarrier || !tempTrackingNumber || isSubmittingRequest}
                  className="flex-[2] bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  {isSubmittingRequest ? <i className="fa-solid fa-spinner fa-spin" /> : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
