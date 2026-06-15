import { NextRequest, NextResponse } from 'next/server';
import { requireUser, errorResponse } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase-service';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUser();
    const body = await req.json();
    const { phone_number } = body;

    if (!phone_number) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const sb = getServiceSupabase();
    const { error } = await sb
      .from('users')
      .update({
        phone_number,
        tos_accepted_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
