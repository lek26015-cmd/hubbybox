'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { HUBBYBOX_WAREHOUSE_LOCATION, BOX_STATUS } from '@/lib/hubbybox-constants';
import type { BoxRow, ItemRow } from '@/lib/types';
import { useLiff } from '@/components/providers/liff-provider';
import { useToast } from '@/components/ui/toast';

export function useBoxData(boxId: string) {
  const { toast } = useToast();
  const { dbUser, isLoading: isLiffLoading } = useLiff();

  const [box, setBox] = useState<BoxRow | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccessError, setHasAccessError] = useState(false);

  // Submitting states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Move modal data
  const [otherBoxes, setOtherBoxes] = useState<BoxRow[]>([]);
  const [isLoadingOtherBoxes, setIsLoadingOtherBoxes] = useState(false);

  // Derived state
  const isOwner = !!(box && dbUser && box.user_id === dbUser.id);
  const isInWarehouse = !!box?.location?.includes(HUBBYBOX_WAREHOUSE_LOCATION);
  const isInTransit = box?.status === BOX_STATUS.SHIPPING_TO_WAREHOUSE;
  const isLocked = !!(box && (isInTransit || isInWarehouse));

  // ── Data fetching ──────────────────────────────────────────────────

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
      } catch {
        // Fetch error handled by showing empty/not-found state
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [boxId, dbUser, isLiffLoading]);

  // ── Helpers ────────────────────────────────────────────────────────

  const patchBox = async (updates: Record<string, unknown>) => {
    const res = await fetch(`/api/boxes/${boxId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Update failed');
    }
    return res.json();
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
    } catch {
      // Silently handle – user can retry
    } finally {
      setIsLoadingOtherBoxes(false);
    }
  }, [dbUser?.id, boxId]);

  // ── Mutations ──────────────────────────────────────────────────────

  const addItem = async (name: string, imageUrl: string | null = null) => {
    const res = await fetch(`/api/boxes/${boxId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), image_url: imageUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed');
    }
    const { item } = await res.json();
    setItems((prev) => [item, ...prev]);
    return item;
  };

  const deleteItem = async (itemId: string) => {
    const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const moveItem = async (itemId: string, targetBoxId: string) => {
    const res = await fetch(`/api/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ box_id: targetBoxId }),
    });
    if (!res.ok) throw new Error('Move failed');
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const moveBulkItems = async (itemIds: string[], targetBoxId: string) => {
    const res = await fetch('/api/items/bulk-move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds, targetBoxId, sourceBoxId: boxId }),
    });
    if (!res.ok) throw new Error('Bulk move failed');
    const movedSet = new Set(itemIds);
    setItems((prev) => prev.filter((i) => !movedSet.has(i.id)));
  };

  const updateBox = async (updates: Record<string, unknown>) => {
    await patchBox(updates);
    setBox((prev) => (prev ? { ...prev, ...updates } as BoxRow : prev));
  };

  return {
    // Data
    box, setBox, items, setItems, dbUser,
    otherBoxes, isLoadingOtherBoxes,
    // State
    isLoading, setIsLoading, hasAccessError,
    isSubmitting, setIsSubmitting,
    isSubmittingRequest, setIsSubmittingRequest,
    // Derived
    isOwner, isInWarehouse, isInTransit, isLocked,
    // Actions
    patchBox, fetchOtherBoxes,
    addItem, deleteItem, moveItem, moveBulkItems, updateBox,
    // Toast helper
    toast,
  };
}
