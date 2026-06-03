import { NextRequest } from 'next/server';
import { requireUser, requireItemOwner, requireBoxOwner, errorResponse } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase-service';

export const runtime = 'nodejs';

/**
 * DELETE /api/items/[id]
 * 
 * Delete a single item. Ownership verified via item → box → user.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser();
    const { id: itemId } = await params;
    await requireItemOwner(userId, itemId);

    const sb = getServiceSupabase();
    const { error } = await sb.from('items').delete().eq('id', itemId);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

/**
 * PATCH /api/items/[id]
 * Body: { box_id: string } — move item to another box
 * 
 * Move an item to a different box. Both source and target box ownership are verified.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser();
    const { id: itemId } = await params;
    await requireItemOwner(userId, itemId);

    const body = await req.json();
    const { box_id: targetBoxId } = body;

    if (!targetBoxId || typeof targetBoxId !== 'string') {
      return Response.json({ error: 'Target box_id required' }, { status: 400 });
    }

    // Verify user owns the target box too
    await requireBoxOwner(userId, targetBoxId);

    const sb = getServiceSupabase();
    const { data, error } = await sb
      .from('items')
      .update({ box_id: targetBoxId })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;

    return Response.json({ item: data });
  } catch (err) {
    return errorResponse(err);
  }
}
