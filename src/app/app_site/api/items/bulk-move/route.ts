import { NextRequest } from 'next/server';
import { requireUser, requireBoxOwner, errorResponse } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase-service';

export const runtime = 'nodejs';

/**
 * POST /api/items/bulk-move
 * Body: { itemIds: string[], targetBoxId: string, sourceBoxId: string }
 * 
 * Move multiple items to another box. Ownership verified for both boxes.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await requireUser();
    const body = await req.json();
    const { itemIds, targetBoxId, sourceBoxId } = body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return Response.json({ error: 'itemIds array required' }, { status: 400 });
    }
    if (!targetBoxId || !sourceBoxId) {
      return Response.json({ error: 'targetBoxId and sourceBoxId required' }, { status: 400 });
    }

    // Verify user owns BOTH boxes
    await requireBoxOwner(userId, sourceBoxId);
    await requireBoxOwner(userId, targetBoxId);

    const sb = getServiceSupabase();
    const { error } = await sb
      .from('items')
      .update({ box_id: targetBoxId })
      .in('id', itemIds)
      .eq('box_id', sourceBoxId); // Safety: only move items that are actually in source box

    if (error) throw error;

    return Response.json({ ok: true, moved: itemIds.length });
  } catch (err) {
    return errorResponse(err);
  }
}
