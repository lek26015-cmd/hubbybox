import { NextRequest } from 'next/server';
import { requireUser, requireBoxOwner, errorResponse } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase-service';

export const runtime = 'nodejs';

/**
 * POST /api/boxes/[id]/items
 * Body: { name: string, image_url?: string | null }
 * 
 * Add an item to the box. Ownership verified.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser();
    const { id: boxId } = await params;
    await requireBoxOwner(userId, boxId);

    const body = await req.json();
    const { name, image_url } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return Response.json({ error: 'Item name is required' }, { status: 400 });
    }

    const sb = getServiceSupabase();

    // Check item limit
    const { count } = await sb
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('box_id', boxId);

    if ((count ?? 0) >= 50) {
      return Response.json({ error: 'กล่องนี้มีของครบ 50 ชิ้นแล้ว' }, { status: 400 });
    }

    const { data, error } = await sb
      .from('items')
      .insert({
        box_id: boxId,
        name: name.trim(),
        image_url: image_url ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ item: data });
  } catch (err) {
    return errorResponse(err);
  }
}
