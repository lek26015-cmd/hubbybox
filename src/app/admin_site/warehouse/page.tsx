'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { HUBBYBOX_WAREHOUSE_LOCATION, BOX_STATUS } from '@/lib/hubbybox-constants';
import type { BoxListRow } from '@/lib/box-types';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type SupplyOrderListRow = {
  id: string;
  product_name: string;
  price: number;
  status: string | null;
  created_at: string;
  user_id: string;
};

export default function AdminWarehousePage() {
  const [inbound, setInbound] = useState<BoxListRow[]>([]);
  const [stored, setStored] = useState<BoxListRow[]>([]);
  const [atHomeCount, setAtHomeCount] = useState(0);
  const [supplyOrders, setSupplyOrders] = useState<SupplyOrderListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  
  // Systematic Modal States
  const [editingBox, setEditingBox] = useState<BoxListRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<string | null>(null);
  const [editCarrier, setEditCarrier] = useState('');
  const [editTracking, setEditTracking] = useState('');
  const [zone, setZone] = useState('');
  const [shelf, setShelf] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: bErr } = await supabase
        .from('boxes')
        .select('id, name, user_id, status, shipping_carrier, tracking_number, created_at, location')
        .limit(200);
      
      if (bErr) throw bErr;

      const rows = (data || []) as BoxListRow[];
      
      const inboundRows = rows.filter((b) => b.status === BOX_STATUS.SHIPPING_TO_WAREHOUSE);
      
      // Stored (Warehouse) are those that are NOT inbound AND have the warehouse string in their location
      const storedRows = rows.filter((b) => 
        b.status !== BOX_STATUS.SHIPPING_TO_WAREHOUSE && 
        (b.location || '').includes(HUBBYBOX_WAREHOUSE_LOCATION)
      );

      // At Home are those that are NOT inbound AND are NOT in the warehouse
      const homeRows = rows.filter((b) => 
        b.status !== BOX_STATUS.SHIPPING_TO_WAREHOUSE && 
        !(b.location || '').includes(HUBBYBOX_WAREHOUSE_LOCATION)
      );
      
      setInbound(inboundRows);
      setStored(storedRows);
      setAtHomeCount(homeRows.length);

      // Fetch supply orders
      const { data: orders } = await supabase
        .from('supplies_orders')
        .select('id, product_name, price, status, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(20);
      
      setSupplyOrders((orders as SupplyOrderListRow[]) || []);
    } catch (e: any) {
      setError(e?.message || 'Error loading warehouse data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveBox = async () => {
    if (!editingBox) return;
    setBusyId(editingBox.id);
    try {
      const finalLocation = zone && shelf 
        ? `${HUBBYBOX_WAREHOUSE_LOCATION} (Zone ${zone} - Shelf ${shelf})`
        : HUBBYBOX_WAREHOUSE_LOCATION;

      const updateData: any = { 
        name: editName,
        status: editStatus,
        shipping_carrier: editCarrier,
        tracking_number: editTracking,
        location: finalLocation 
      };
      
      const { error: upErr } = await supabase
        .from('boxes')
        .update(updateData)
        .eq('id', editingBox.id);

      if (upErr) throw upErr;
      
      setEditingBox(null);
      await load();
      alert('บันทึกข้อมูลเรียบร้อย!');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setBusyId(null);
    }
  };

  const openEditModal = (box: BoxListRow) => {
     setEditingBox(box);
     setEditName(box.name || '');
     setEditStatus(box.status || null);
     setEditCarrier(box.shipping_carrier || '');
     setEditTracking(box.tracking_number || '');
     
     // Parse current location if possible
     const loc = box.location || '';
     const zoneMatch = loc.match(/Zone\s(.*?)\s-/);
     const shelfMatch = loc.match(/Shelf\s(.*?)\)/);
     
     setZone(zoneMatch ? zoneMatch[1] : '');
     setShelf(shelfMatch ? shelfMatch[1] : '');
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10 pb-24">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8 border-b border-admin-border">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Operations Center</p>
            <h1 className="text-3xl font-black text-admin-text-primary tracking-tight">คลัง &amp; รับฝาก</h1>
            <p className="text-slate-400 text-sm font-medium mt-2 max-w-xl leading-relaxed">
               จัดการพัสดุเข้าคลังและพิกัดการจัดเก็บอย่างเป็นระบบ
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="bg-white border border-admin-border text-slate-500 font-black text-[10px] uppercase tracking-widest px-8 py-3.5 rounded-xl hover:text-admin-text-primary hover:border-vora-accent/40 shadow-sm transition-all w-fit"
          >
            Refresh Warehouse
          </button>
        </header>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-600 text-sm font-bold shadow-sm">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatPill label="Pending Inbound" value={inbound.length} accent />
          <StatPill label="Active Storage" value={stored.length} />
          <StatPill label="Boxes at Home" value={atHomeCount} />
          <StatPill label="Supply Orders" value={supplyOrders.filter((o) => o.status === 'pending').length} />
        </section>

        {/* Inbound List */}
        <section className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-8 border-b border-admin-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
            <h2 className="font-black text-lg text-admin-text-primary">พัสดุเข้า — รอเจ้าหน้าที่รับ</h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
               <div className="relative w-full sm:w-64 group">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xs"></i>
                  <input 
                     type="text" 
                     placeholder="Search Ref ID..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                     className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-admin-text-primary focus:outline-none focus:border-primary/30 transition-all shadow-sm"
                  />
               </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-slate-400 text-sm font-bold text-center py-20">กำลังโหลดข้อมูลระบบ...</p>
            ) : inbound.length === 0 ? (
              <p className="text-slate-400 text-sm font-medium text-center py-20">ไม่มีกล่องที่รอรับเข้าคลังในขณะนี้</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50/30 border-b border-admin-border text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-4">Box Info</th>
                      <th className="px-8 py-4">Logistics</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-admin-border bg-white">
                  {inbound
                    .filter(b => !searchTerm || (b.id && b.id.toUpperCase().includes(searchTerm)) || (b.name && b.name.toUpperCase().includes(searchTerm)))
                    .map((box) => (
                    <tr key={box.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                         <p className="font-bold text-admin-text-primary text-sm truncate">{box.name}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                           Ref: HB-{box.id.slice(0, 6).toUpperCase()}
                         </p>
                      </td>
                      <td className="px-8 py-4">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{box.shipping_carrier || 'Manual Drop-off'}</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin_site/box/${box.id}`}
                              className="text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg bg-slate-900 text-vora-accent shadow-lg shadow-black/10 hover:bg-black transition-all active:scale-95 flex items-center gap-2"
                            >
                               <i className="fa-solid fa-eye text-[10px]"></i>
                               View Items
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditModal(box)}
                              className="text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg bg-primary text-white shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
                            >
                              <i className="fa-solid fa-sliders text-[10px]"></i>
                              Manage Box
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Active Storage List */}
        <section className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-8 border-b border-admin-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
            <div>
               <h2 className="font-black text-lg text-admin-text-primary">พัสดุในคลัง — จัดเก็บเรียบร้อย</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Active Storage (Sorted by Receipt Date)</p>
            </div>
            <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-md">
               <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest whitespace-nowrap">
                  In Warehouse: {stored.length}
               </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-slate-400 text-sm font-bold text-center py-20">กำลังโหลดคลัง...</p>
            ) : stored.length === 0 ? (
               <p className="text-slate-400 text-sm font-medium text-center py-20">ไม่มีพัสดุจัดเก็บอยู่ในคลังตอนนี้</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50/30 border-b border-admin-border text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-4">Box & User</th>
                      <th className="px-8 py-4">Storage Location</th>
                      <th className="px-8 py-4">Stored Since</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-admin-border bg-white">
                  {stored
                    .filter(b => !searchTerm || (b.id && b.id.toUpperCase().includes(searchTerm)) || (b.name && b.name.toUpperCase().includes(searchTerm)))
                    .map((box) => (
                    <tr key={box.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-vora-accent shadow-lg shadow-black/5">
                               <i className="fa-solid fa-box-archive" aria-hidden="true"></i>
                            </div>
                            <div>
                               <p className="font-bold text-admin-text-primary text-sm truncate">{box.name}</p>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                 HB-{box.id.slice(0, 6).toUpperCase()} · {(box.user_id || '').slice(0, 8)}…
                               </p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-4">
                         <button 
                            onClick={() => openEditModal(box)}
                            className="group/loc flex flex-col items-start gap-1 text-left"
                         >
                            <div className="flex items-center gap-2 group-hover/loc:text-sky-500 transition-colors">
                               <i className="fa-solid fa-location-crosshairs text-sky-400 text-[10px]" aria-hidden="true"></i>
                               <span className="text-xs font-black text-slate-700 tracking-tight italic">
                                  {box.location || 'คลังกลาง Hubbybox'}
                               </span>
                               <i className="fa-solid fa-pen-to-square text-[8px] opacity-0 group-hover/loc:opacity-100 transition-opacity ml-1" aria-hidden="true"></i>
                            </div>
                            {box.status === 'returning' && (
                               <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase font-sans">
                                  กำลังรอส่งคืน
                               </span>
                            )}
                         </button>
                      </td>
                      <td className="px-8 py-4">
                         <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                              {box.created_at ? new Date(box.created_at).toLocaleDateString('th-TH', { 
                                 day: '2-digit', 
                                 month: 'short', 
                                 year: 'numeric' 
                              }) : '-'}
                            </p>
                            <button 
                               onClick={() => openEditModal(box)}
                               className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-primary hover:bg-white border border-admin-border flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            >
                               <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Global Supplies Orders (Reference) */}
        <section className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-8 border-b border-admin-border bg-slate-50/50">
            <h2 className="font-black text-lg text-admin-text-primary">Supplies Orders</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Latest items from Hubby Supplies Marketplace
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <tbody className="divide-y divide-admin-border bg-white text-sm">
                {supplyOrders.length === 0 ? (
                  <tr><td className="px-8 py-16 text-center text-slate-400">No recent supply orders.</td></tr>
                ) : (
                  supplyOrders.map((o) => (
                    <tr key={o.id} className="group hover:bg-slate-50/50 transition-colors border-b">
                      <td className="px-8 py-4 font-bold text-admin-text-primary text-xs">{o.product_name}</td>
                      <td className="px-8 py-4 text-slate-500 font-black text-xs">฿{o.price.toLocaleString()}</td>
                      <td className="px-8 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Systematic Management Modal */}
      <AnimatePresence>
        {editingBox && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setEditingBox(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-10 shadow-2xl overflow-hidden border border-admin-border"
            >
               {/* Modal Header */}
               <div className="flex items-start justify-between mb-10">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-vora-accent shadow-xl shadow-black/10">
                        <i className="fa-solid fa-box-archive text-2xl" aria-hidden="true"></i>
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-admin-text-primary tracking-tight">Manage Box Details</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.15em] mt-1">
                           Reference ID: <span className="text-primary tracking-normal font-black">HB-{editingBox.id.slice(0, 8).toUpperCase()}</span>
                        </p>
                     </div>
                  </div>
                  <button onClick={() => setEditingBox(null)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 hover:text-slate-500 flex items-center justify-center transition-colors">
                     <i className="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
                  </button>
               </div>

               {/* Modal Body - 2 Columns */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  {/* Left Column: Basic Info */}
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Box Name / Label</label>
                        <input 
                           type="text" 
                           value={editName}
                           onChange={(e) => setEditName(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-admin-text-primary focus:outline-none focus:border-primary/20 transition-all"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status</label>
                        <div className="relative">
                           <select 
                              value={editStatus || ''}
                              onChange={(e) => setEditStatus(e.target.value || null)}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-admin-text-primary focus:outline-none focus:border-primary/20 transition-all appearance-none cursor-pointer"
                           >
                              <option value="">Stored (Active)</option>
                              <option value={BOX_STATUS.SHIPPING_TO_WAREHOUSE}>Inbound (Shipping)</option>
                              <option value={BOX_STATUS.RETURNING}>Returning</option>
                              <option value={BOX_STATUS.REQUESTED_RETURN}>Requested Return</option>
                           </select>
                           <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]"></i>
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Logistics & Storage */}
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Carrier</label>
                           <input 
                              type="text" 
                              placeholder="e.g. Flash" 
                              value={editCarrier}
                              onChange={(e) => setEditCarrier(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-admin-text-primary focus:outline-none focus:border-primary/20 transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tracking #</label>
                           <input 
                              type="text" 
                              placeholder="TH..." 
                              value={editTracking}
                              onChange={(e) => setEditTracking(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-admin-text-primary focus:outline-none focus:border-primary/20 transition-all"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 bg-slate-900 rounded-[2rem] p-6 lg:p-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Zone</label>
                           <input 
                              type="text" 
                              placeholder="A" 
                              value={zone}
                              onChange={(e) => setZone(e.target.value.toUpperCase())}
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-5 text-sm font-black text-vora-accent focus:outline-none focus:border-vora-accent/30 transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Shelf</label>
                           <input 
                              type="text" 
                              placeholder="01" 
                              value={shelf}
                              onChange={(e) => setShelf(e.target.value.toUpperCase())}
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-5 text-sm font-black text-vora-accent focus:outline-none focus:border-vora-accent/30 transition-all"
                           />
                        </div>
                        <p className="col-span-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                           <i className="fa-solid fa-map-marker-alt text-vora-accent"></i>
                           Storage Slot Assignment
                        </p>
                     </div>
                  </div>
               </div>

               {/* Modal Actions */}
               <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-400 italic">
                     * การเปลี่ยนแปลงข้อมูลจะส่งผลต่อสถานะที่ลูกค้ามองเห็นทันที
                  </p>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                     <button 
                       onClick={() => setEditingBox(null)}
                       className="flex-1 sm:flex-none px-10 py-4 rounded-2xl text-sm font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                     >
                       Discard
                     </button>
                     <button 
                       onClick={() => handleSaveBox()}
                       disabled={busyId === editingBox.id}
                       className="flex-1 sm:flex-none px-12 py-4 bg-primary text-white rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                     >
                        {busyId === editingBox.id ? (
                           <i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                        ) : (
                           <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
                        )}
                        บันทึกการแก้ไข
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}

function StatPill({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-8 shadow-sm transition-all hover:shadow-md ${
        accent ? 'border-vora-accent/30 bg-white ring-4 ring-vora-accent/[0.03]' : 'border-admin-border bg-white ring-4 ring-slate-400/[0.02]'
      }`}
    >
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{label}</p>
      <p className={`text-5xl font-black tracking-tighter ${accent ? 'text-vora-accent drop-shadow-sm' : 'text-admin-text-primary'}`}>{value}</p>
      <div className="mt-4 flex items-center gap-2">
         <div className={`w-1.5 h-1.5 rounded-full ${accent ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Sync</span>
      </div>
    </div>
  );
}
