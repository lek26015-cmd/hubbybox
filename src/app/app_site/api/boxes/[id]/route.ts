import { NextRequest } from 'next/server';
import { requireUser, requireBoxOwner, errorResponse } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase-service';

export const runtime = 'nodejs';

/**
 * PATCH /api/boxes/[id]
 * Body: { name?, location?, allow_staff_open?, shipping_carrier?, tracking_number?, access_code?, access_code_expires_at?, cover_image_url? }
 * 
 * Update box fields. Ownership verified before any mutation.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser();
    const { id: boxId } = await params;
    await requireBoxOwner(userId, boxId);

    const body = await req.json();

    // Whitelist allowed fields to prevent arbitrary column updates
    const allowed = [
      'name', 'location', 'allow_staff_open',
      'shipping_carrier', 'tracking_number',
      'access_code', 'access_code_expires_at',
      'cover_image_url', 'status',
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const sb = getServiceSupabase();
    const { data, error } = await sb
      .from('boxes')
      .update(updates)
      .eq('id', boxId)
      .select()
      .single();

    if (error) throw error;

    return Response.json({ box: data });
  } catch (err) {
    return errorResponse(err);
  }
}

/**
 * DELETE /api/boxes/[id]
 * 
 * Delete a box and all its items. Ownership verified.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser();
    const { id: boxId } = await params;
    await requireBoxOwner(userId, boxId);

    const sb = getServiceSupabase();

    // Delete items first (foreign key)
    await sb.from('items').delete().eq('box_id', boxId);

    const { error } = await sb.from('boxes').delete().eq('id', boxId);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
