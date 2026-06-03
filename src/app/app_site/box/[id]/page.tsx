'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import type { ItemRow } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/components/ui/confirm-modal';

// Extracted components & hook
import { useBoxData } from '@/hooks/use-box-data';
import { BoxHeader } from '@/components/boxes/box-header';
import { BoxStatusCard } from '@/components/boxes/box-status-card';
import { LogisticsStepper } from '@/components/boxes/logistics-stepper';
import { LogisticsStatusCard } from '@/components/boxes/logistics-status-card';
import { ItemList } from '@/components/boxes/item-list';
import { SelectionBar } from '@/components/boxes/selection-bar';
import { MoveModal } from '@/components/boxes/move-modal';
import { TrackingModal } from '@/components/boxes/tracking-modal';
import { AccessCodeModal } from '@/components/boxes/access-code-modal';
import { FullscreenImage } from '@/components/boxes/fullscreen-image';
import { ManualAddForm } from '@/components/boxes/manual-add-form';
import { PrintableQrLabel } from '@/components/boxes/printable-qr-label';

export default function BoxDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const boxId = unwrappedParams.id;
  const { confirm } = useConfirm();

  // All data & mutations from custom hook
  const {
    box, setBox, items, setItems, dbUser,
    otherBoxes, isLoadingOtherBoxes,
    isLoading, setIsLoading, hasAccessError,
    isSubmitting, setIsSubmitting,
    isSubmittingRequest, setIsSubmittingRequest,
    isOwner, isInWarehouse, isInTransit, isLocked,
    patchBox, fetchOtherBoxes,
    addItem, deleteItem, moveItem, moveBulkItems, updateBox,
    toast,
  } = useBoxData(boxId);

  // UI-only state
  const [newItemName, setNewItemName] = useState('');
  const [isEditingBoxName, setIsEditingBoxName] = useState(false);
  const [editedBoxName, setEditedBoxName] = useState('');
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<ItemRow | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedFullScreenImage, setSelectedFullScreenImage] = useState<string | null>(null);
  const [boxUrl, setBoxUrl] = useState('');
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [generatedAccessCode, setGeneratedAccessCode] = useState<string | null>(null);
  const [isAccessCodeModalOpen, setIsAccessCodeModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [tempCarrier, setTempCarrier] = useState('');
  const [tempTrackingNumber, setTempTrackingNumber] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBoxUrl(`${window.location.origin}/box/${boxId}`);
    }
  }, [boxId]);

  // ── Handlers (thin wrappers around hook mutations) ─────────────────

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || isSubmitting || !isOwner || isLocked) return;
    if (items.length >= 50) { toast('ไม่สามารถเพิ่มของได้แล้ว: กล่องนี้มีของครบ 50 ชิ้นตามที่กำหนดแล้วครับ', 'warning'); return; }
    setIsSubmitting(true);
    try {
      await addItem(newItemName);
      setNewItemName('');
    } catch (err: unknown) {
      toast('เพิ่มของไม่สำเร็จ: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isOwner) return;
    if (items.length >= 50) { toast('ไม่สามารถเพิ่มของได้แล้ว: กล่องนี้มีของครบ 50 ชิ้นตามที่กำหนดแล้วครับ', 'warning'); e.target.value = ''; return; }

    setIsSubmitting(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${boxId}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('box-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('box-images').getPublicUrl(filePath);

      const visionResp = await fetch('/api/vision', { method: 'POST', body: JSON.stringify({ imageUrl: publicUrl }), headers: { 'Content-Type': 'application/json' } });
      const responseText = await visionResp.text();
      let visionResult;
      try { visionResult = JSON.parse(responseText); } catch { throw new Error('เซิร์ฟเวอร์ส่งข้อมูลกลับไม่ถูกต้อง (AI Vision)'); }
      if (!visionResp.ok || visionResult.error) throw new Error(visionResult.error || 'การแสกนล้มเหลว');

      const newItems = visionResult.result.split(',').map((s: string) => s.trim()).filter(Boolean);
      const availableSpace = 50 - items.length;
      if (newItems.length > availableSpace) toast(`พื้นที่ในกล่องเหลือเพียง ${availableSpace} ชิ้น (แสกนเจอ ${newItems.length} ชิ้น) ระบบจะบันทึกเท่าที่พื้นที่เหลือครับ`, 'warning');
      const itemsToAdd = newItems.slice(0, availableSpace);

      for (const itemName of itemsToAdd) {
        const { data: newItem } = await supabase.from('items').insert({ box_id: boxId, name: itemName, image_url: publicUrl }).select().single();
        if (newItem) setItems(prev => [newItem as ItemRow, ...prev]);
      }
      toast(`Hubby AI แสกนสำเร็จ! เพิ่มของใหม่: ${newItems.length} รายการ`, 'success');
    } catch (err: unknown) {
      toast('การแสกนล้มเหลว: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
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
      const { error: uploadError } = await supabase.storage.from('box-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('box-images').getPublicUrl(filePath);
      await patchBox({ cover_image_url: publicUrl });
      setBox({ ...box!, cover_image_url: publicUrl });
    } catch (err: unknown) {
      toast('เปลี่ยนรูปหน้าตากล่องไม่สำเร็จ: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
      e.target.value = '';
    }
  };

  const handleUpdateBoxName = async () => {
    if (!box || !editedBoxName.trim() || editedBoxName === box.name || !isOwner || isLocked) { setIsEditingBoxName(false); return; }
    try { await updateBox({ name: editedBoxName.trim() }); } catch { toast('ไม่สามารถเปลี่ยนชื่อกล่องได้', 'error'); }
    finally { setIsEditingBoxName(false); }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (isLocked) { toast('ไม่สามารถลบของได้เมื่อกล่องอยู่ในคลัง', 'warning'); return; }
    if (!isOwner) return;
    const confirmed = await confirm({ title: 'ลบของชิ้นนี้?', message: 'คุณแน่ใจหรือไม่ว่าต้องการลบของชิ้นนี้?', variant: 'danger', confirmLabel: 'ลบเลย' });
    if (!confirmed) return;
    try { await deleteItem(itemId); } catch { toast('ลบไม่สำเร็จ กรุณาลองใหม่', 'error'); }
  };

  const handleMoveItem = async (targetBoxId: string) => {
    if (isLocked) { toast('ไม่สามารถย้ายของได้เมื่อกล่องอยู่ในคลัง', 'warning'); return; }
    if (!itemToMove || !isOwner) return;
    try { await moveItem(itemToMove.id, targetBoxId); setIsMoveModalOpen(false); setItemToMove(null); toast('ย้ายของเรียบร้อย!', 'success'); }
    catch { toast('ย้ายไม่สำเร็จ กรุณาลองใหม่', 'error'); }
  };

  const handleMoveBulkItems = async (targetBoxId: string) => {
    const idsToMove = Array.from(selectedItemIds);
    if (!isOwner || idsToMove.length === 0) return;
    try { await moveBulkItems(idsToMove, targetBoxId); setIsMoveModalOpen(false); setIsSelectionMode(false); setSelectedItemIds(new Set()); toast(`ย้ายของ ${idsToMove.length} รายการเรียบร้อย!`, 'success'); }
    catch { toast('ย้ายไม่สำเร็จ กรุณาลองใหม่', 'error'); }
  };

  const handleToggleStaffOpen = async () => {
    if (!isOwner || isSubmittingRequest || !box) return;
    setIsSubmittingRequest(true);
    try { await updateBox({ allow_staff_open: !box.allow_staff_open }); }
    catch (err: unknown) { toast('เปลี่ยนค่าไม่ได้: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error'); }
    finally { setIsSubmittingRequest(false); }
  };

  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner || isSubmittingRequest) return;
    setIsSubmittingRequest(true);
    try { await updateBox({ shipping_carrier: tempCarrier.trim(), tracking_number: tempTrackingNumber.trim() }); setIsTrackingModalOpen(false); toast('อัปเดตข้อมูลพัสดุเรียบร้อย!', 'success'); }
    catch (err: unknown) { toast('อัปเดตไม่สำเร็จ: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error'); }
    finally { setIsSubmittingRequest(false); }
  };

  const handleGenerateAccessCode = async () => {
    if (!isOwner || isSubmittingRequest) return;
    setIsSubmittingRequest(true);
    try {
      const array = new Uint32Array(1); crypto.getRandomValues(array);
      const code = (100000 + (array[0] % 900000)).toString();
      const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await updateBox({ access_code: code, access_code_expires_at: expiry });
      setGeneratedAccessCode(code); setIsAccessCodeModalOpen(true);
    } catch (err: unknown) { toast('ไม่สามารถสร้างรหัสได้: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error'); }
    finally { setIsSubmittingRequest(false); }
  };

  const handleToggleSelection = (itemId: string) => {
    const newSet = new Set(selectedItemIds);
    if (newSet.has(itemId)) newSet.delete(itemId);
    else newSet.add(itemId);
    setSelectedItemIds(newSet);
  };

  // ── Loading / Error States ─────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-[#e0f2fe] to-white flex-col gap-5 font-sans">
        <i className="fa-solid fa-spinner fa-spin text-sky-400 text-[48px]" aria-hidden="true" />
        <span className="text-sky-600 font-bold tracking-widest text-sm">กำลังเปิดกล่อง...</span>
        <button onClick={() => setIsLoading(false)} className="mt-8 text-xs text-sky-400 font-medium underline opacity-50 hover:opacity-100">เข้าไม่ได้? คลิกเพื่อข้ามการโหลด</button>
      </div>
    );
  }

  if (hasAccessError) {
    return (
      <div className="flex flex-col h-screen p-6 justify-center items-center text-center bg-rose-50 font-sans">
        <i className="fa-solid fa-shield-halved text-[64px] text-rose-300 mb-6 drop-shadow-sm" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-slate-800 mb-3">คุณไม่มีสิทธิ์เข้าถึงกล่องนี้</h2>
        <p className="text-slate-500 mb-10 max-w-xs leading-relaxed">ข้อมูลนี้เป็นของส่วนตัว เฉพาะเจ้าของกล่องเท่านั้นที่สามารถดูได้ครับ</p>
        <button onClick={() => router.push('/')} className="px-8 py-4 bg-white border border-rose-100 hover:bg-rose-50 active:scale-95 transition-all text-rose-600 rounded-full font-bold shadow-sm">กลับหน้าหลักอย่างปลอดภัย</button>
      </div>
    );
  }

  if (!box) {
    return (
      <div className="flex flex-col h-screen p-6 justify-center items-center text-center bg-slate-50 font-sans">
        <i className="fa-solid fa-circle-exclamation text-[64px] text-slate-300 mb-6 drop-shadow-sm" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-slate-800 mb-3">ไม่พบกล่องที่คุณหา</h2>
        <p className="text-slate-500 mb-10 max-w-xs leading-relaxed">กล่องนี้อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>
        <button onClick={() => router.push('/')} className="px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-700 rounded-full font-bold shadow-sm">กลับหน้าหลัก</button>
      </div>
    );
  }

  // ── Main Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cae9fd] via-[#e6f4fc] to-white text-slate-800 font-sans selection:bg-sky-200 flex flex-col print:bg-none print:bg-white print:min-h-0 print:block overflow-x-hidden">
      <BoxHeader
        box={box} boxId={boxId} isOwner={isOwner} isLocked={isLocked}
        isEditingBoxName={isEditingBoxName} editedBoxName={editedBoxName}
        onEditBoxName={() => { setIsEditingBoxName(true); setEditedBoxName(box.name); }}
        onCancelEditBoxName={() => { setIsEditingBoxName(false); setEditedBoxName(box.name); }}
        onSaveBoxName={handleUpdateBoxName}
        onEditBoxNameChange={setEditedBoxName}
        onPatchBox={patchBox} onSetBox={setBox} toast={toast}
      />

      <main className="print:hidden flex-1 w-full max-w-md mx-auto px-6 py-8 flex flex-col pt-10">
        <BoxStatusCard
          box={box} boxId={boxId} items={items}
          isOwner={isOwner} isLocked={isLocked} isInWarehouse={isInWarehouse} isInTransit={isInTransit}
          isSubmitting={isSubmitting} isActionMenuOpen={isActionMenuOpen}
          onSetActionMenuOpen={setIsActionMenuOpen} onSetManualAddOpen={setIsManualAddOpen}
          onSetSelectionMode={setIsSelectionMode} onSetTrackingModalOpen={setIsTrackingModalOpen}
          onSetTempCarrier={setTempCarrier} onSetTempTrackingNumber={setTempTrackingNumber}
          onImageUpload={handleImageUpload} onCoverUpload={handleCoverUpload}
        />

        {isOwner && <LogisticsStepper box={box} />}

        {isOwner && (
          <LogisticsStatusCard
            box={box} boxId={boxId}
            isOwner={isOwner} isInWarehouse={isInWarehouse} isInTransit={isInTransit}
            isSubmittingRequest={isSubmittingRequest}
            onToggleStaffOpen={handleToggleStaffOpen}
            onOpenTrackingModal={(carrier, tracking) => { setTempCarrier(carrier); setTempTrackingNumber(tracking); setIsTrackingModalOpen(true); }}
          />
        )}

        {isOwner && isManualAddOpen && (
          <ManualAddForm
            newItemName={newItemName} isSubmitting={isSubmitting} isLocked={!!isLocked}
            onSetNewItemName={setNewItemName} onSubmit={handleAddItem}
            onClose={() => setIsManualAddOpen(false)}
          />
        )}

        <ItemList
          items={items} isOwner={isOwner} isLocked={!!isLocked}
          isSelectionMode={isSelectionMode} selectedItemIds={selectedItemIds}
          onToggleSelection={handleToggleSelection}
          onOpenMoveModal={(item) => { setItemToMove(item); setIsMoveModalOpen(true); fetchOtherBoxes(); }}
          onDeleteItem={handleDeleteItem}
          onOpenFullScreenImage={setSelectedFullScreenImage}
          onToggleSelectionMode={() => { setIsSelectionMode(!isSelectionMode); setSelectedItemIds(new Set()); }}
        />
      </main>

      <SelectionBar
        isSelectionMode={isSelectionMode} selectedItemIds={selectedItemIds}
        box={box} boxId={boxId} isSubmittingRequest={isSubmittingRequest}
        onCancelSelection={() => { setIsSelectionMode(false); setSelectedItemIds(new Set()); }}
        onOpenMoveModal={() => { setIsMoveModalOpen(true); fetchOtherBoxes(); }}
      />

      <MoveModal
        isOpen={isMoveModalOpen} isSelectionMode={isSelectionMode}
        selectedCount={selectedItemIds.size} itemToMove={itemToMove}
        otherBoxes={otherBoxes} isLoadingOtherBoxes={isLoadingOtherBoxes}
        onClose={() => setIsMoveModalOpen(false)}
        onMoveItem={handleMoveItem} onMoveBulkItems={handleMoveBulkItems}
      />

      <FullscreenImage imageUrl={selectedFullScreenImage} onClose={() => setSelectedFullScreenImage(null)} />
      <PrintableQrLabel box={box} boxUrl={boxUrl} />

      <TrackingModal
        isOpen={isTrackingModalOpen}
        tempCarrier={tempCarrier} tempTrackingNumber={tempTrackingNumber}
        isSubmittingRequest={isSubmittingRequest}
        onSetTempCarrier={setTempCarrier} onSetTempTrackingNumber={setTempTrackingNumber}
        onClose={() => setIsTrackingModalOpen(false)} onSubmit={handleUpdateTracking}
      />

      <AccessCodeModal
        isOpen={isAccessCodeModalOpen} accessCode={generatedAccessCode}
        onClose={() => setIsAccessCodeModalOpen(false)}
      />
    </div>
  );
}
