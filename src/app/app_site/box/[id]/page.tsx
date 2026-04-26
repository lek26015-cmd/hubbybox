'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { HUBBYBOX_WAREHOUSE_LOCATION, BOX_STATUS } from '@/lib/hubbybox-constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLiff } from '@/components/providers/liff-provider';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function BoxDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const boxId = unwrappedParams.id;
  
  const [box, setBox] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newItemName, setNewItemName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Box Management State
  const [isEditingBoxName, setIsEditingBoxName] = useState(false);
  const [editedBoxName, setEditedBoxName] = useState('');
  
  // Move Item State
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<any>(null);
  const [otherBoxes, setOtherBoxes] = useState<any[]>([]);
  const [isLoadingOtherBoxes, setIsLoadingOtherBoxes] = useState(false);

  // Selection State
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Item Image State
  const [selectedFullScreenImage, setSelectedFullScreenImage] = useState<string | null>(null);

  const { dbUser, isLoading: isLiffLoading } = useLiff();

  const [boxUrl, setBoxUrl] = useState('');
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [generatedAccessCode, setGeneratedAccessCode] = useState<string | null>(null);
  const [accessCodeExpiry, setAccessCodeExpiry] = useState<string | null>(null);
  const [isAccessCodeModalOpen, setIsAccessCodeModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBoxUrl(`${window.location.origin}/box/${boxId}`);
    }
  }, [boxId]);

  // Security State
  const [hasAccessError, setHasAccessError] = useState(false);
  const isOwner = box && dbUser && box.user_id === dbUser.id;
  const isInWarehouse = box?.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION);
  const isInTransit = box?.status === BOX_STATUS.SHIPPING_TO_WAREHOUSE;
  const isLocked = box && (isInTransit || isInWarehouse);

  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [tempCarrier, setTempCarrier] = useState('');
  const [tempTrackingNumber, setTempTrackingNumber] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (isLiffLoading) return;
      setIsLoading(true);
      
      try {
        const { data: boxData, error: boxError } = await supabase
          .from('boxes')
          .select('*')
          .eq('id', boxId)
          .single();
          
        if (boxError || !boxData) throw new Error('Box not found');
        
        // Ownership Check
        if (dbUser && boxData.user_id !== dbUser.id) {
          setHasAccessError(true);
          setIsLoading(false);
          return;
        }

        setBox(boxData);

        const { data: itemsData } = await supabase
          .from('items')
          .select('*')
          .eq('box_id', boxId)
          .order('created_at', { ascending: false });
          
        if (itemsData) setItems(itemsData);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [boxId, dbUser, isLiffLoading]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || isSubmitting || !isOwner || isLocked) return;
    
    if (items.length >= 50) {
      alert('ไม่สามารถเพิ่มของได้แล้ว: กล่องนี้มีของครบ 50 ชิ้นตามที่กำหนดแล้วครับ');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('items')
        .insert({
          box_id: boxId,
          name: newItemName.trim(),
          image_url: null
        })
        .select()
        .single();

      if (error) throw error;
      
      setItems([data, ...items]);
      setNewItemName('');
    } catch (err) {
      console.error('Error adding item:', err);
      alert('เพิ่มของไม่สำเร็จ: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isOwner) return;

    if (items.length >= 50) {
      alert('ไม่สามารถเพิ่มของได้แล้ว: กล่องนี้มีของครบ 50 ชิ้นตามที่กำหนดแล้วครับ');
      e.target.value = '';
      return;
    }

    setIsSubmitting(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${boxId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('box-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('box-images')
        .getPublicUrl(filePath);

      const visionResp = await fetch('/api/vision', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: publicUrl }),
        headers: { 'Content-Type': 'application/json' }
      });

      const responseText = await visionResp.text();
      let visionResult;
      try {
        visionResult = JSON.parse(responseText);
      } catch (e) {
        throw new Error('เซิร์ฟเวอร์ส่งข้อมูลกลับไม่ถูกต้อง (AI Vision)');
      }

      if (!visionResp.ok || visionResult.error) {
        throw new Error(visionResult.error || 'การแสกนล้มเหลว');
      }

      const { result } = visionResult;

      const newItems = result.split(',').map((s: string) => s.trim()).filter(Boolean);
      
      const availableSpace = 50 - items.length;
      if (newItems.length > availableSpace) {
        alert(`พื้นที่ในกล่องเหลือเพียง ${availableSpace} ชิ้น (แสกนเจอ ${newItems.length} ชิ้น) ระบบจะบันทึกเท่าที่พื้นที่เหลือครับ`);
      }
      const itemsToAdd = newItems.slice(0, availableSpace);
      
      for (const itemName of itemsToAdd) {
        const { data: newItem, error: insertError } = await supabase
          .from('items')
          .insert({ 
            box_id: boxId, 
            name: itemName,
            image_url: publicUrl 
          })
          .select()
          .single();
        
        if (newItem) setItems(prev => [newItem, ...prev]);
        if (insertError) console.error('Insert error:', insertError);
      }

      alert(`Hubby AI แสกนสำเร็จ! เพิ่มของใหม่: ${newItems.length} รายการ`);
    } catch (err: any) {
      console.error('Scan Error:', err);
      alert('การแสกนล้มเหลว: ' + err.message);
    } finally {
      setIsSubmitting(false);
      e.target.value = '';
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isOwner) return;

    setIsSubmitting(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cover-${Date.now()}.${fileExt}`;
      const filePath = `${boxId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('box-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('box-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('boxes')
        .update({ cover_image_url: publicUrl })
        .eq('id', boxId);

      if (updateError) throw updateError;

      setBox({ ...box, cover_image_url: publicUrl });
    } catch (err: any) {
      console.error('Upload Error:', err);
      alert('เปลี่ยนรูปหน้าตากล่องไม่สำเร็จ: ' + err.message);
    } finally {
      setIsSubmitting(false);
      e.target.value = '';
    }
  };

  const handleUpdateBoxName = async () => {
    if (!editedBoxName.trim() || editedBoxName === box.name || !isOwner || isLocked) {
      setIsEditingBoxName(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('boxes')
        .update({ name: editedBoxName.trim() })
        .eq('id', boxId);

      if (error) throw error;
      setBox({ ...box, name: editedBoxName.trim() });
    } catch (err) {
      console.error('Error updating box name:', err);
      alert('ไม่สามารถเปลี่ยนชื่อกล่องได้');
    } finally {
      setIsEditingBoxName(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (isLocked) {
      alert('ไม่สามารถลบของได้เมื่อกล่องอยู่ในคลัง');
      return;
    }
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบของชิ้นนี้?') || !isOwner) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('ลบไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  const fetchOtherBoxes = useCallback(async () => {
    if (!dbUser?.id) return;
    setIsLoadingOtherBoxes(true);
    try {
      const { data, error } = await supabase
        .from('boxes')
        .select('*')
        .eq('user_id', dbUser.id)
        .neq('id', boxId)
        .order('name');

      if (error) throw error;
      setOtherBoxes(data || []);
    } catch (err) {
      console.error('Error fetching other boxes:', err);
    } finally {
      setIsLoadingOtherBoxes(false);
    }
  }, [dbUser?.id, boxId]);

  const handleMoveItem = async (targetBoxId: string) => {
    if (isLocked) {
      alert('ไม่สามารถย้ายของได้เมื่อกล่องอยู่ในคลัง');
      return;
    }
    if (!itemToMove || !isOwner) return;

    try {
      const { error } = await supabase
        .from('items')
        .update({ box_id: targetBoxId })
        .eq('id', itemToMove.id);

      if (error) throw error;
      
      setItems(items.filter(item => item.id !== itemToMove.id));
      setIsMoveModalOpen(false);
      setItemToMove(null);
      alert(`ย้ายของเรียบร้อย!`);
    } catch (err) {
      console.error('Error moving item:', err);
      alert('ย้ายไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  const handleMoveBulkItems = async (targetBoxId: string) => {
    const idsToMove = Array.from(selectedItemIds);
    if (!isOwner || idsToMove.length === 0) return;

    try {
      const { error } = await supabase
        .from('items')
        .update({ box_id: targetBoxId })
        .in('id', idsToMove);

      if (error) throw error;
      
      setItems(items.filter(item => !selectedItemIds.has(item.id)));
      setIsMoveModalOpen(false);
      setIsSelectionMode(false);
      setSelectedItemIds(new Set());
      alert(`ย้ายของ ${idsToMove.length} รายการเรียบร้อย!`);
    } catch (err) {
      console.error('Error moving items:', err);
      alert('ย้ายไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  const handleRecallBox = () => {
    if (!isOwner) return;
    router.push(`/storage/recall?box_id=${boxId}`);
  };

  const handleToggleStaffOpen = async () => {
    if (!isOwner || isSubmittingRequest) return;
    const newValue = !box.allow_staff_open;

    setIsSubmittingRequest(true);
    try {
      const { error } = await supabase
        .from('boxes')
        .update({ allow_staff_open: newValue })
        .eq('id', boxId);

      if (error) throw error;
      setBox({ ...box, allow_staff_open: newValue });
    } catch (err: any) {
      console.error('Toggle error:', err);
      alert('เปลี่ยนค่าไม่ได้: ' + err.message);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleRequestItemReturn = () => {
    if (!isOwner || selectedItemIds.size === 0) return;
    const ids = Array.from(selectedItemIds).join(',');
    router.push(`/storage/recall?box_id=${boxId}&item_ids=${ids}`);
  };

  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner || isSubmittingRequest) return;

    setIsSubmittingRequest(true);
    try {
      const { error } = await supabase
        .from('boxes')
        .update({ 
          shipping_carrier: tempCarrier.trim(),
          tracking_number: tempTrackingNumber.trim()
        })
        .eq('id', boxId);

      if (error) throw error;
      setBox({ ...box, shipping_carrier: tempCarrier.trim(), tracking_number: tempTrackingNumber.trim() });
      setIsTrackingModalOpen(false);
      alert('อัปเดตข้อมูลพัสดุเรียบร้อย!');
    } catch (err: any) {
      console.error('Update tracking error:', err);
      alert('อัปเดตไม่สำเร็จ: ' + err.message);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleGenerateAccessCode = async () => {
    if (!isOwner || isSubmittingRequest) return;
    
    setIsSubmittingRequest(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

      const { error } = await supabase
        .from('boxes')
        .update({ 
          access_code: code,
          access_code_expires_at: expiry
        })
        .eq('id', boxId);

      if (error) throw error;
      
      setGeneratedAccessCode(code);
      setAccessCodeExpiry(expiry);
      setIsAccessCodeModalOpen(true);
    } catch (err: any) {
      console.error('Generate code error:', err);
      alert('ไม่สามารถสร้างรหัสได้: ' + err.message);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  if (isLoading) {
     return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-[#e0f2fe] to-white flex-col gap-5 font-sans">
        <i className="fa-solid fa-spinner fa-spin text-sky-400 text-[48px]" aria-hidden="true"></i>
        <span className="text-sky-600 font-bold tracking-widest text-sm">กำลังเปิดกล่อง...</span>
        <button 
          onClick={() => setIsLoading(false)} 
          className="mt-8 text-xs text-sky-400 font-medium underline opacity-50 hover:opacity-100"
        >
          เข้าไม่ได้? คลิกเพื่อข้ามการโหลด
        </button>
      </div>
    );
  }

  if (hasAccessError) {
    return (
       <div className="flex flex-col h-screen p-6 justify-center items-center text-center bg-rose-50 font-sans">
         <i className="fa-solid fa-shield-halved text-[64px] text-rose-300 mb-6 drop-shadow-sm" aria-hidden="true"></i>
         <h2 className="text-2xl font-bold text-slate-800 mb-3">คุณไม่มีสิทธิ์เข้าถึงกล่องนี้</h2>
         <p className="text-slate-500 mb-10 max-w-xs leading-relaxed">ข้อมูลนี้เป็นของส่วนตัว เฉพาะเจ้าของกล่องเท่านั้นที่สามารถดูได้ครับ</p>
         <button onClick={() => router.push('/')} className="px-8 py-4 bg-white border border-rose-100 hover:bg-rose-50 active:scale-95 transition-all text-rose-600 rounded-full font-bold shadow-sm">
           กลับหน้าหลักอย่างปลอดภัย
         </button>
       </div>
    );
  }

  if (!box) {
     return (
        <div className="flex flex-col h-screen p-6 justify-center items-center text-center bg-slate-50 font-sans">
          <i className="fa-solid fa-circle-exclamation text-[64px] text-slate-300 mb-6 drop-shadow-sm" aria-hidden="true"></i>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">ไม่พบกล่องที่คุณหา</h2>
          <p className="text-slate-500 mb-10 max-w-xs leading-relaxed">กล่องนี้อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>
          <button onClick={() => router.push('/')} className="px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-700 rounded-full font-bold shadow-sm">
            กลับหน้าหลัก
          </button>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cae9fd] via-[#e6f4fc] to-white text-slate-800 font-sans selection:bg-sky-200 flex flex-col print:bg-none print:bg-white print:min-h-0 print:block overflow-x-hidden">
      {/* Header */}
      <header className="print:hidden sticky top-0 z-20 bg-white/70 backdrop-blur-2xl border-b border-white/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="w-11 h-11 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-600 active:scale-90 transition-all hover:bg-slate-50 hover:text-sky-500">
           <i className="fa-solid fa-arrow-left text-[20px]" aria-hidden="true"></i>
        </Link>
        <div className="flex items-center gap-3 flex-1 px-4 justify-center">
            <div className="w-10 h-10 overflow-hidden shrink-0">
               <Image 
                 src="/logo.png" 
                 alt="HubbyBox" 
                 width={40} 
                 height={40} 
                 className="object-contain w-full h-full"
               />
            </div>
            <div className="flex flex-col items-center">
              {isEditingBoxName && isOwner ? (
                <input
                  autoFocus
                  type="text"
                  value={editedBoxName}
                  onChange={(e) => setEditedBoxName(e.target.value)}
                  onBlur={handleUpdateBoxName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateBoxName();
                    if (e.key === 'Escape') {
                      setIsEditingBoxName(false);
                      setEditedBoxName(box.name);
                    }
                  }}
                  className="bg-primary/5 border-b-2 border-primary focus:outline-none font-bold text-xl text-slate-800 w-full max-w-[200px] px-1 animate-pulse text-center"
                />
              ) : (
                <div 
                  onClick={() => {
                    if (isOwner) {
                      setIsEditingBoxName(true);
                      setEditedBoxName(box.name);
                    }
                  }}
                  className={`flex items-center gap-2 ${isOwner ? 'cursor-pointer group' : ''}`}
                >
                  <span className="font-bold text-xl text-slate-800 line-clamp-1">{box?.name}</span>
                  {isOwner && !isLocked && <i className="fa-solid fa-pen text-[12px] text-slate-300 group-hover:text-sky-400" aria-hidden="true"></i>}
                </div>
              )}
              
              {/* Location Badge & Quick Edit */}
              <button 
                onClick={async () => {
                  if (!isOwner || isLocked) return;
                  if (box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION)) {
                    const newLoc = window.prompt('ย้ายกลับมาที่บ้าน? ระบุพิกัด (เช่น ห้องพระ) หรือปล่อยว่างเพื่อใช้ "ที่บ้าน"', 'ที่บ้าน');
                    if (newLoc !== null) {
                      const { error } = await supabase.from('boxes').update({ location: newLoc || 'ที่บ้าน' }).eq('id', boxId);
                      if (!error) setBox({ ...box, location: newLoc || 'ที่บ้าน' });
                    }
                  } else {
                    const newLoc = window.prompt('เปลี่ยนพิกัดที่เก็บในบ้าน:', box.location);
                    if (newLoc !== null) {
                      const { error } = await supabase.from('boxes').update({ location: newLoc || 'ที่บ้าน' }).eq('id', boxId);
                      if (!error) setBox({ ...box, location: newLoc || 'ที่บ้าน' });
                    }
                  }
                }}
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
                onClick={() => {
                  alert('คลังสินค้าของเรากำลังก่อสร้างและเตรียมระบบ ขออภัยในความไม่สะดวกครับ (Coming Soon)');
                }}
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

      <main className="print:hidden flex-1 w-full max-w-md mx-auto px-6 py-8 flex flex-col pt-10">
        {/* Status / Overview */}
        <div className={`z-10 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_-15px_rgba(56,189,248,0.25)] rounded-3xl p-8 mb-8 flex items-center justify-between relative group ${box?.cover_image_url ? 'bg-slate-900 border-slate-700' : 'bg-gradient-to-br from-white to-sky-50/50'}`}>
            <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl pointer-events-none">
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
                  <p className={`${box?.cover_image_url ? 'text-white/80' : 'text-slate-500'} font-bold text-sm tracking-wide mb-1`}>จำนวนของในกล่อง</p>
                  <h2 className={`text-7xl font-black drop-shadow-sm leading-tight ${box?.cover_image_url ? 'text-white drop-shadow-md' : 'bg-gradient-to-br from-primary to-blue-600 bg-clip-text text-transparent'}`}>{items.length}</h2>
               </div>
            </div>
            
            {/* Box Cover Upload Overlay Button */}
            {isOwner && (
               <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="file" id="cover-image-upload" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={isSubmitting} />
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
                                <input type="file" id="camera-capture" accept="image/*" capture="environment" className="hidden" onChange={(e) => { handleImageUpload(e); setIsActionMenuOpen(false); }} disabled={isSubmitting} />
                                <label htmlFor="camera-capture" className="w-full h-full bg-white/95 backdrop-blur-md border border-white shadow-xl rounded-xl flex flex-col gap-1 items-center justify-center cursor-pointer text-sky-500 hover:scale-105 active:scale-95 transition-all">
                                    <i className="fa-solid fa-camera text-[24px]" aria-hidden="true"></i>
                                    <span className="text-[10px] font-bold tracking-wide">ถ่ายรูป</span>
                                </label>
                              </div>
                              <div className={`absolute top-0 right-0 w-16 h-[4.5rem] transition-all duration-500 delay-75 ${isActionMenuOpen ? 'translate-y-40 opacity-100 pointer-events-auto' : 'opacity-0 scale-50'}`}>
                                <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={(e) => { handleImageUpload(e); setIsActionMenuOpen(false); }} disabled={isSubmitting} />
                                <label htmlFor="image-upload" className="w-full h-full bg-white/95 backdrop-blur-md border border-white shadow-xl rounded-xl flex flex-col gap-1 items-center justify-center cursor-pointer text-sky-500 hover:scale-105 active:scale-95 transition-all">
                                    <i className="fa-regular fa-image text-[24px]" aria-hidden="true"></i>
                                    <span className="text-[10px] font-bold tracking-wide">สแกนรูป</span>
                                </label>
                              </div>
                              <div className={`absolute top-0 right-0 w-16 h-[4.5rem] transition-all duration-500 delay-100 ${isActionMenuOpen ? 'translate-y-60 opacity-100 pointer-events-auto' : 'opacity-0 scale-50'}`}>
                                <button onClick={() => { setIsManualAddOpen(true); setIsActionMenuOpen(false); setTimeout(() => document.getElementById('manual-name-input')?.focus(), 100); }} className="w-full h-full bg-white/95 backdrop-blur-md border border-white shadow-xl rounded-xl flex flex-col gap-1 items-center justify-center text-indigo-500 hover:scale-105 active:scale-95 transition-all">
                                    <i className="fa-solid fa-pen text-[24px]" aria-hidden="true"></i>
                                    <span className="text-[10px] font-bold tracking-wide">จดชื่อ</span>
                                </button>
                              </div>
                            </>
                          )}
                          
                          {isInWarehouse && (
                            <div className={`absolute top-0 right-0 w-16 h-[4.5rem] transition-all duration-500 ${isActionMenuOpen ? 'translate-y-20 opacity-100 pointer-events-auto' : 'opacity-0 scale-50'}`}>
                              <button onClick={() => { setIsSelectionMode(true); setIsActionMenuOpen(false); }} className="w-full h-full bg-slate-900 border border-slate-700 shadow-xl rounded-xl flex flex-col gap-1 items-center justify-center text-amber-400 hover:scale-105 active:scale-95 transition-all">
                                  <i className="fa-solid fa-parachute-box text-[24px]" aria-hidden="true"></i>
                                  <span className="text-[10px] font-bold tracking-wide">เรียกของคืน</span>
                              </button>
                            </div>
                          )}

                          {isInTransit && (
                            <div className={`absolute top-0 right-0 w-16 h-[4.5rem] transition-all duration-500 ${isActionMenuOpen ? 'translate-y-20 opacity-100 pointer-events-auto' : 'opacity-0 scale-50'}`}>
                              <button 
                                onClick={() => { 
                                  setTempCarrier(box.shipping_carrier || '');
                                  setTempTrackingNumber(box.tracking_number || '');
                                  setIsTrackingModalOpen(true); 
                                  setIsActionMenuOpen(false); 
                                }} 
                                className="w-full h-full bg-indigo-500 border border-indigo-400 shadow-xl rounded-xl flex flex-col gap-1 items-center justify-center text-white hover:scale-105 active:scale-95 transition-all"
                              >
                                  <i className="fa-solid fa-truck-fast text-[24px]" aria-hidden="true"></i>
                                  <span className="text-[10px] font-bold tracking-wide">เลขพัสดุ</span>
                              </button>
                            </div>
                          )}
                       </div>
                       <button onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} className={`h-[4.5rem] w-16 border-2 border-white shadow-xl rounded-xl flex items-center justify-center text-white z-40 relative group transition-all ${isLocked ? 'bg-slate-800' : 'bg-gradient-to-br from-primary to-[#2a7aeb]'}`}>
                          {isSubmitting ? <i className="fa-solid fa-spinner fa-spin text-[32px]" aria-hidden="true"></i> : <i className={`fa-solid ${isLocked ? 'fa-ellipsis-vertical' : 'fa-plus'} text-[32px] transition-transform duration-500 ${isActionMenuOpen ? 'rotate-[135deg]' : ''}`} aria-hidden="true"></i>}
                       </button>
                    </div>
                 </div>
            )}
         </div>

        {/* Logistics Progress Stepper */}
        {isOwner && box.location !== 'ที่บ้าน' && box.location !== null && (
           <div className="mb-8 px-2">
              <div className="flex items-center justify-between relative">
                 {/* Line connection */}
                 <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0">
                    <div 
                       className="h-full bg-primary transition-all duration-1000" 
                       style={{ 
                         width: box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION) ? (box.location?.includes('Zone') ? '100%' : '50%') : '0%' 
                       }}
                    ></div>
                 </div>
                 
                 {[
                    { label: 'กำลังนำส่ง', icon: 'fa-truck-fast' },
                    { label: 'ถึงคลังแล้ว', icon: 'fa-warehouse' },
                    { label: 'จัดเก็บเรียบร้อย', icon: 'fa-circle-check' }
                 ].map((step, idx) => {
                    const isActive = (idx === 0 && box.status === BOX_STATUS.SHIPPING_TO_WAREHOUSE) || 
                                   (idx === 1 && box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION) && !box.allow_staff_open) ||
                                   (idx === 2 && box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION) && box.allow_staff_open);
                    const isCompleted = (idx === 0 && box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION)) ||
                                      (idx === 1 && box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION) && box.allow_staff_open);
                    
                    return (
                       <div key={idx} className="flex flex-col items-center gap-2 relative z-10 w-20">
                          <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                             isActive ? 'bg-primary border-primary/20 text-white shadow-lg shadow-primary/20 scale-110' : 
                             isCompleted ? 'bg-primary border-primary text-white scale-100' :
                             'bg-white border-slate-100 text-slate-300'
                          }`}>
                             <i className={`fa-solid ${isCompleted ? 'fa-check' : step.icon} text-sm`} aria-hidden="true"></i>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest text-center leading-tight ${isActive || isCompleted ? 'text-slate-800' : 'text-slate-300'}`}>
                             {step.label}
                          </span>
                       </div>
                    );
                 })}
              </div>
           </div>
        )}

         {/* Logistics & Recall Status Card */}
         {isOwner && (
          <div className="mb-8 space-y-4">
            {/* Main Logistics Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${box.location === HUBBYBOX_WAREHOUSE_LOCATION ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'}`}>
                         <i className={`fa-solid ${box.location === HUBBYBOX_WAREHOUSE_LOCATION ? 'fa-warehouse' : 'fa-house-user'}`} aria-hidden="true"></i>
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-800 text-sm">สถานะปัจจุบัน</h4>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">Current Status</p>
                      </div>
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      box.status === 'returning' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                      box.status === BOX_STATUS.SHIPPING_TO_WAREHOUSE ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      box.location === HUBBYBOX_WAREHOUSE_LOCATION ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 
                      'bg-emerald-100 text-emerald-600 border-emerald-200'
                   }`}>
                      {box.status === 'returning'
                        ? 'กำลังส่งคืน'
                        : box.status === BOX_STATUS.SHIPPING_TO_WAREHOUSE
                          ? 'กำลังนำส่งเข้าคลัง'
                          : box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION)
                            ? 'อยู่ในคลัง'
                            : 'อยู่ที่บ้าน'}
                   </span>
                </div>

                {box.shipping_carrier || isInTransit ? (
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
                            onClick={() => {
                              setTempCarrier(box.shipping_carrier || '');
                              setTempTrackingNumber('');
                              setIsTrackingModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-sky-500 underline"
                          >
                            เพิ่มเลขพัสดุ
                          </button>
                        )}
                     </div>
                  </div>
                ) : null}
                
                {isInTransit && box.shipping_carrier && (
                   <button 
                    onClick={() => {
                      setTempCarrier(box.shipping_carrier || '');
                      setTempTrackingNumber(box.tracking_number || '');
                      setIsTrackingModalOpen(true);
                    }}
                    className="w-full mt-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all"
                   >
                     แก้ไขข้อมูลการจัดส่ง
                   </button>
                )}
             </div>

             {/* Recall & permission: only when physically in warehouse workflow (not in-transit) */}
             {box.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION) &&
              box.status !== 'returning' &&
              box.status !== BOX_STATUS.SHIPPING_TO_WAREHOUSE && (
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                      <i className="fa-solid fa-parachute-box text-[60px]" aria-hidden="true"></i>
                   </div>
                   
                   <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                         <h4 className="font-bold text-lg">การจัดการกล่องในคลัง</h4>
                         <i className="fa-solid fa-shield-check text-sky-400" aria-hidden="true"></i>
                      </div>
                      <p className="text-xs text-white/60 font-medium leading-relaxed">คุณสามารถเรียกคืนทั้งกล่อง หรืออนุญาตให้เจ้าหน้าที่เปิดเพื่อส่งของคืนแยกชิ้นได้</p>
                   </div>

                   <div className="flex flex-col gap-3 relative z-10">
                      {/* Permission Toggle */}
                      <button 
                        onClick={handleToggleStaffOpen}
                        
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${box.allow_staff_open ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'bg-white/5 border-white/10 text-white/70'}`}
                      >
                         <div className="flex items-center gap-3">
                            <i className={`fa-solid ${box.allow_staff_open ? 'fa-unlock' : 'fa-lock'} text-lg`} aria-hidden="true"></i>
                            <div className="text-left">
                               <span className="block text-sm font-bold">อนุญาตให้เจ้าหน้าที่เปิด</span>
                               <span className="block text-[9px] font-black uppercase tracking-widest opacity-60">Staff Open Permission</span>
                            </div>
                         </div>
                         <div className={`w-10 h-6 rounded-full relative transition-colors ${box.allow_staff_open ? 'bg-sky-500' : 'bg-white/20'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${box.allow_staff_open ? 'left-5' : 'left-1'}`}></div>
                         </div>
                      </button>

                      {/* Recall Button */}
                       <button 
                        onClick={handleRecallBox}
                        disabled={isSubmittingRequest}
                        className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                         <i className="fa-solid fa-arrow-rotate-left" aria-hidden="true"></i>
                         เรียกคืนกล่องนี้กลับบ้าน
                      </button>
                   </div>
                </div>
             )}
           </div>
         )}

        {/* Manual Add Form */}
        {isOwner && isManualAddOpen && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10 relative">
              <form onSubmit={(e) => { handleAddItem(e); setIsManualAddOpen(false); }} className="relative flex flex-col gap-4">
                 <button type="button" onClick={() => setIsManualAddOpen(false)} className="absolute -top-3 -right-2 w-8 h-8 bg-slate-100 border border-white rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 shadow-sm z-10 transition-colors">
                    <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                 </button>
                 <div className="flex bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl border-2 border-white shadow-xl overflow-hidden group focus-within:ring-4 ring-primary/10 transition-all opacity-95">
                    <input id="manual-name-input" type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder={isLocked ? "ไม่รองรับการจดชื่อขณะอยู่ในคลัง" : "จดชื่อของเพิ่มเติม..."} disabled={isLocked} className="w-full bg-transparent py-5 pl-6 pr-4 text-slate-800 text-lg font-bold focus:outline-none disabled:opacity-50" />
                    <button type="submit" disabled={!newItemName.trim() || isSubmitting || isLocked} className="w-[88px] bg-primary hover:bg-primary/90 disabled:bg-slate-100 text-white flex items-center justify-center transition-all">
                       <i className="fa-solid fa-plus text-[28px]" aria-hidden="true"></i>
                    </button>
                 </div>
              </form>
            </motion.div>
        )}

        {/* Item List */}
        <div className="flex-1">
           <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="font-bold text-sm text-slate-500">รายการสิ่งของ ({items.length})</h3>
             {items.length > 0 && isOwner && (
               <button 
                 onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedItemIds(new Set()); }}
                 className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${isSelectionMode ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-primary hover:bg-primary/5'}`}
               >
                 {isSelectionMode ? 'เสร็จสิ้น' : 'เลือก'}
               </button>
             )}
           </div>
           
           {items.length === 0 ? (
               <div className="text-center py-16 px-6 border-2 border-dashed border-primary/20 rounded-3xl mt-2 bg-white/40 backdrop-blur-sm">
                  <div className="w-20 h-20 bg-white border border-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm text-primary">
                    <i className="fa-solid fa-box-open text-[32px]" aria-hidden="true"></i>
                  </div>
                  <p className="font-bold text-xl text-slate-700 mb-2">กล่องว่างเปล่า</p>
                  <p className="text-sm font-medium text-slate-500 max-w-[200px] mx-auto leading-relaxed">ใส่ของลงกล่องเลย!</p>
               </div>
           ) : (
                <ul className="flex flex-col gap-3">
                 {items.map(item => {
                    const isSelected = selectedItemIds.has(item.id);
                    return (
                    <li key={item.id} onClick={() => { if (isSelectionMode) { const newSet = new Set(selectedItemIds); if (isSelected) newSet.delete(item.id); else newSet.add(item.id); setSelectedItemIds(newSet); } }} className={`bg-white/90 backdrop-blur-md border border-white/50 shadow-sm px-4 py-4 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-all group overflow-hidden relative ${isSelectionMode ? 'cursor-pointer active:scale-[0.98]' : ''} ${isSelected ? 'ring-2 ring-primary !bg-primary/5' : ''}`}>
                        {isSelectionMode && (
                           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200'}`}>
                              {isSelected && <i className="fa-solid fa-check text-[10px]"></i>}
                           </div>
                        )}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-inner cursor-pointer active:scale-95 transition-transform ${item.image_url ? '' : 'bg-primary/5 text-primary'}`} onClick={(e) => { if (isSelectionMode) return; e.stopPropagation(); item.image_url && setSelectedFullScreenImage(item.image_url); }}>
                          {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <i className="fa-solid fa-box-open text-[20px]" aria-hidden="true"></i>}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                           <span className="font-bold text-slate-700 text-lg line-clamp-1 leading-tight">{item.name}</span>
                        </div>
                        {!isSelectionMode && isOwner && !isLocked && (
                            <div className="flex gap-2">
                               <button onClick={(e) => { e.stopPropagation(); setItemToMove(item); setIsMoveModalOpen(true); fetchOtherBoxes(); }} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all border border-slate-100 shadow-sm">
                                 <i className="fa-solid fa-right-left text-[14px]" aria-hidden="true"></i>
                               </button>
                               <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100 shadow-sm">
                                 <i className="fa-solid fa-trash-can text-[14px]" aria-hidden="true"></i>
                               </button>
                            </div>
                        )}
                    </li>
                 )})}
                </ul>
           )}
        </div>
      </main>

      {/* Selection Mode Actions */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
             <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl md:rounded-3xl shadow-2xl flex items-center justify-between">
                <div className="pl-4">
                   <p className="text-white font-black">{selectedItemIds.size} รายการ</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">เลือกอยู่</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => { setIsSelectionMode(false); setSelectedItemIds(new Set()); }} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all">ยกเลิก</button>
                   
                   {box.location === HUBBYBOX_WAREHOUSE_LOCATION && box.allow_staff_open ? (
                     <button 
                       onClick={handleRequestItemReturn}
                       disabled={selectedItemIds.size === 0 || isSubmittingRequest}
                       className="px-6 py-3 bg-amber-500 text-white rounded-xl text-sm font-black shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                     >
                        <i className="fa-solid fa-parachute-box"></i> ส่งคืนแยกชิ้น
                     </button>
                   ) : (
                     <button onClick={() => { if (selectedItemIds.size > 0) { setIsMoveModalOpen(true); fetchOtherBoxes(); } }} className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all outline-none">ย้ายไปที่...</button>
                   )}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMoveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMoveModalOpen(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="w-full max-w-md bg-white rounded-t-3xl p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h3 className="text-2xl font-black text-slate-800">ย้ายไปกล่องไหนดี?</h3>
                      <p className="text-slate-500 font-medium">ย้าย <span className="text-primary font-bold">{isSelectionMode ? `${selectedItemIds.size} รายการ` : `"${itemToMove?.name}"`}</span> ไปยัง...</p>
                   </div>
                   <button onClick={() => setIsMoveModalOpen(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100"><i className="fa-solid fa-xmark"></i></button>
                </div>
                <div className="max-h-[50vh] overflow-y-auto pr-2">
                   {isLoadingOtherBoxes ? (
                      <div className="py-12 flex flex-col items-center gap-3"><i className="fa-solid fa-spinner fa-spin text-primary text-[32px]"></i><p className="text-sm text-slate-400">กำลังค้นหากล่อง...</p></div>
                   ) : otherBoxes.length === 0 ? (
                      <div className="py-12 text-center bg-slate-50 rounded-[2rem]"><p className="text-slate-500 font-bold">ยังไม่มีกล่องอื่นเลย</p></div>
                   ) : (
                      <div className="flex flex-col gap-3 pb-4">
                         {otherBoxes.map(b => (
                            <button key={b.id} onClick={() => { if (isSelectionMode) handleMoveBulkItems(b.id); else handleMoveItem(b.id); }} className="w-full text-left p-5 rounded-2xl bg-slate-50 hover:bg-primary/5 border border-slate-100 hover:border-primary/20 transition-all flex items-center justify-between group">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary shadow-sm transition-colors border border-slate-100"><i className="fa-solid fa-box text-[18px]"></i></div>
                                  <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">{b.name}</span>
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

      {selectedFullScreenImage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-6" onClick={() => setSelectedFullScreenImage(null)}>
          <div className="absolute top-8 right-8"><button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl"><i className="fa-solid fa-xmark"></i></button></div>
          <img src={selectedFullScreenImage} className="max-w-full max-h-full rounded-3xl shadow-2xl border-2 border-white/20" alt="Full Preview" />
        </div>
      )}

      {/* Printable QR Code Label */}
      <div className="hidden print:flex fixed inset-0 z-[9999] bg-white flex-col items-center justify-center h-screen w-screen absolute">
        <div className="border-[4px] border-slate-900 rounded-[2rem] p-8 flex flex-col items-center justify-center w-[400px] max-w-full gap-6 text-center bg-white">
           <div className="flex items-center gap-3">
              <i className="fa-solid fa-box-open text-4xl text-slate-900"></i>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">HubbyBox</h1>
           </div>
           <div className="w-full h-[3px] bg-slate-900 rounded-full my-1"></div>
           <div className="bg-white p-4 border-[4px] border-slate-900 rounded-3xl">
             <QRCodeSVG value={boxUrl} size={240} level="H" fgColor="#0f172a" />
           </div>
           <div className="flex flex-col items-center gap-1 mt-3">
             <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">ชื่อกล่อง / BOX NAME</span>
             <h2 className="text-4xl font-black text-slate-900 leading-tight line-clamp-2 px-4 break-words">{box.name}</h2>
           </div>
           <div className="bg-slate-900 text-white rounded-[1.5rem] w-full py-5 mt-4 relative overflow-hidden">
             <p className="font-bold text-xl relative z-10">สแกนเพื่อดูของข้างใน</p>
             <p className="text-[10px] font-black text-white/50 tracking-[0.1em] mt-1 relative z-10 underline decoration-primary decoration-2">SCAN TO SEE INSIDE</p>
           </div>
        </div>
      </div>
      {/* Tracking Info Modal */}
      <AnimatePresence>
        {isTrackingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-md" onClick={() => setIsTrackingModalOpen(false)}>
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className="w-full max-w-md bg-white rounded-t-[2.5rem] p-8 shadow-2xl relative" 
              onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h3 className="text-2xl font-black text-slate-800">ระบุเลขพัสดุ</h3>
                      <p className="text-slate-500 font-medium text-sm">ช่วยให้ทีมงานตรวจสอบและรับของได้รวดเร็วขึ้นครับ</p>
                   </div>
                   <button onClick={() => setIsTrackingModalOpen(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100"><i className="fa-solid fa-xmark"></i></button>
                </div>

                <form onSubmit={handleUpdateTracking} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ผู้ให้บริการขนส่ง</label>
                      <select 
                        value={tempCarrier} 
                        onChange={(e) => setTempCarrier(e.target.value)}
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

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เลขพัสดุ (Tracking Number)</label>
                      <input 
                        autoFocus
                        type="text" 
                        value={tempTrackingNumber}
                        onChange={(e) => setTempTrackingNumber(e.target.value)}
                        placeholder="เช่น TH12345678"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 font-bold text-slate-700 placeholder-slate-300 focus:border-primary/30 focus:outline-none transition-all"
                      />
                   </div>

                   <div className="pt-4 flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setIsTrackingModalOpen(false)}
                        className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl active:scale-95 transition-all text-lg"
                      >
                        ยกเลิก
                      </button>
                      <button 
                        type="submit" 
                        disabled={!tempCarrier || !tempTrackingNumber || isSubmittingRequest}
                        className="flex-[2] bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                      >
                         {isSubmittingRequest ? <i className="fa-solid fa-spinner fa-spin"></i> : 'บันทึกข้อมูล'}
                      </button>
                   </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Access Code Modal */}
      <AnimatePresence>
        {isAccessCodeModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
              onClick={() => setIsAccessCodeModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-10 text-center shadow-2xl overflow-hidden border border-white/20"
            >
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/5 rounded-full blur-3xl"></div>
               
               <div className="bg-sky-50 w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-sky-500 mx-auto mb-8 shadow-inner">
                  <i className="fa-solid fa-key text-3xl" aria-hidden="true"></i>
               </div>
               
               <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">รหัสผ่านสำหรับเจ้าหน้าที่</h3>
               <p className="text-xs text-slate-400 font-medium leading-relaxed mb-10 px-4">
                  แจ้งรหัสนี้ให้เจ้าหน้าที่เพื่ออนุญาตให้เปิดกล่องและจัดการของด้านในได้ชั่วคราว
               </p>
               
               <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 mb-8 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-sky-500/0 group-hover:bg-sky-500/5 transition-colors"></div>
                  <span className="text-6xl font-black text-primary tracking-[0.1em] drop-shadow-sm tabular-nums">
                     {generatedAccessCode}
                  </span>
               </div>
               
               <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                     <i className="fa-solid fa-clock-rotate-left fa-spin-reverse" aria-hidden="true"></i>
                     Valid for 15 minutes
                  </div>
                  
                  <button 
                    onClick={() => setIsAccessCodeModalOpen(false)}
                    className="w-full mt-4 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
                  >
                    เข้าใจแล้ว
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
