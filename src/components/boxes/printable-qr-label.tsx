'use client';

import { QRCodeSVG } from 'qrcode.react';
import type { BoxRow } from '@/lib/types';

interface PrintableQrLabelProps {
  box: BoxRow;
  boxUrl: string;
}

export function PrintableQrLabel({ box, boxUrl }: PrintableQrLabelProps) {
  return (
    <div className="hidden print:flex fixed inset-0 z-[9999] bg-white flex-col items-center justify-center h-screen w-screen absolute">
      <div className="border-[4px] border-slate-900 rounded-[2rem] p-8 flex flex-col items-center justify-center w-[400px] max-w-full gap-6 text-center bg-white">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-box-open text-4xl text-slate-900" />
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">HubbyBox</h1>
        </div>
        <div className="w-full h-[3px] bg-slate-900 rounded-full my-1" />
        <div className="bg-white p-4 border-[4px] border-slate-900 rounded-3xl">
          <QRCodeSVG value={boxUrl} size={240} level="H" fgColor="#0f172a" />
        </div>
        <div className="flex flex-col items-center gap-1 mt-3">
          <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
            ชื่อกล่อง / BOX NAME
          </span>
          <h2 className="text-4xl font-black text-slate-900 leading-tight line-clamp-2 px-4 break-words">
            {box.name}
          </h2>
        </div>
        <div className="bg-slate-900 text-white rounded-[1.5rem] w-full py-5 mt-4 relative overflow-hidden">
          <p className="font-bold text-xl relative z-10">สแกนเพื่อดูของข้างใน</p>
          <p className="text-[10px] font-black text-white/50 tracking-[0.1em] mt-1 relative z-10 underline decoration-primary decoration-2">
            SCAN TO SEE INSIDE
          </p>
        </div>
      </div>
    </div>
  );
}
