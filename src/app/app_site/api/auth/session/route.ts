import { NextRequest } from 'next/server';
import { setUserSession, errorResponse } from '@/lib/api-auth';
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
    const { lineUserId } = await req.json();
    if (!lineUserId || typeof lineUserId !== 'string') {
      return Response.json({ error: 'lineUserId required' }, { status: 400 });
    }

    const sb = getServiceSupabase();

    // Find or create the user
    let { data: user, error } = await sb
      .from('users')
      .select('id')
      .eq('line_user_id', lineUserId)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      const { data: created, error: insertErr } = await sb
        .from('users')
        .insert({ line_user_id: lineUserId })
        .select('id')
        .single();
      if (insertErr) throw insertErr;
      user = created;
    }

    // Set signed session cookie
    await setUserSession(user.id);

    return Response.json({ userId: user.id });
  } catch (err) {
    return errorResponse(err);
  }
}
