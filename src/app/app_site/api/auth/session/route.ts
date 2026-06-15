import { NextRequest } from 'next/server';
import { setUserSession, clearUserSession, errorResponse } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase-service';

export const runtime = 'nodejs';

/**
 * POST /api/auth/session
 * Body: { lineUserId: string }
 * 
 * Called by LIFF Provider after successful LINE login.
 * Looks up the DB user by line_user_id and sets a signed HttpOnly session cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lineUserId = body?.lineUserId;
    console.log('[session] POST called with lineUserId:', lineUserId ? `${lineUserId.substring(0, 6)}...` : 'MISSING');

    if (!lineUserId || typeof lineUserId !== 'string') {
      return Response.json({ error: 'lineUserId required' }, { status: 400 });
    }

    console.log('[session] Getting service supabase...');
    const sb = getServiceSupabase();

    // Find or create the user
    console.log('[session] Querying user by line_user_id...');
    let { data: user, error } = await sb
      .from('users')
      .select('id')
      .eq('line_user_id', lineUserId)
      .maybeSingle();

    if (error) {
      console.error('[session] Supabase SELECT error:', error);
      throw error;
    }

    if (!user) {
      console.log('[session] User not found, creating...');
      const { data: created, error: insertErr } = await sb
        .from('users')
        .insert({ line_user_id: lineUserId })
        .select('id')
        .single();
      if (insertErr) {
        console.error('[session] Supabase INSERT error:', insertErr);
        throw insertErr;
      }
      user = created;
    }

    console.log('[session] Setting session cookie for userId:', user.id);
    // Set signed session cookie
    await setUserSession(user.id);

    console.log('[session] Success!');
    return Response.json({ userId: user.id });
  } catch (err) {
    console.error('[session] CATCH error:', err);
    return errorResponse(err);
  }
}

/**
 * DELETE /api/auth/session
 * 
 * Clears the user's session cookie.
 */
export async function DELETE() {
  try {
    await clearUserSession();
    return Response.json({ success: true });
  } catch (err) {
    console.error('[session] DELETE error:', err);
    return errorResponse(err);
  }
}
