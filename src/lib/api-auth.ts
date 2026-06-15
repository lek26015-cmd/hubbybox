import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase-service';

const SESSION_SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSCODE || 'hubby-session-fallback-key';
const COOKIE_NAME = 'hubby_user_session';

// ── Session Cookie (HMAC-signed, stateless) ───────────────────────────
// Format: `<userId>.<signature>`
// The signature = HMAC-SHA256(userId, SESSION_SECRET)

function sign(userId: string): string {
  const sig = createHmac('sha256', SESSION_SECRET).update(userId).digest('hex');
  return `${userId}.${sig}`;
}

function verify(cookieValue: string): string | null {
  const dotIndex = cookieValue.lastIndexOf('.');
  if (dotIndex < 1) return null;

  const userId = cookieValue.slice(0, dotIndex);
  const sig = cookieValue.slice(dotIndex + 1);
  const expected = createHmac('sha256', SESSION_SECRET).update(userId).digest('hex');

  try {
    if (timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return userId;
    }
  } catch {
    // Length mismatch → invalid
  }
  return null;
}

// ── Public API ────────────────────────────────────────────────────────

/** Set signed session cookie after LIFF login. Call from a server API route. */
export async function setUserSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sign(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

/** Clear the session cookie. Call from a server API route during logout. */
export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Read and verify the signed session cookie. Returns the userId or null. */
export async function getUserSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return verify(raw);
}

/** Shortcut: get the authenticated user's DB id, or throw 401-style error. */
export async function requireUser(): Promise<string> {
  const userId = await getUserSession();
  if (!userId) throw new AuthError('Unauthorized', 401);
  return userId;
}

/** Verify that `userId` owns the box. Throws 403 if not. */
export async function requireBoxOwner(userId: string, boxId: string) {
  const sb = getServiceSupabase();
  const { data, error } = await sb
    .from('boxes')
    .select('user_id')
    .eq('id', boxId)
    .single();

  if (error || !data) throw new AuthError('Box not found', 404);
  if (data.user_id !== userId) throw new AuthError('Forbidden', 403);
  return data;
}

/** Verify that `userId` owns the item (via its box). Returns the item row. */
export async function requireItemOwner(userId: string, itemId: string) {
  const sb = getServiceSupabase();
  const { data: item, error: itemErr } = await sb
    .from('items')
    .select('id, box_id, name')
    .eq('id', itemId)
    .single();

  if (itemErr || !item) throw new AuthError('Item not found', 404);

  const { data: box, error: boxErr } = await sb
    .from('boxes')
    .select('user_id')
    .eq('id', item.box_id)
    .single();

  if (boxErr || !box) throw new AuthError('Box not found', 404);
  if (box.user_id !== userId) throw new AuthError('Forbidden', 403);

  return item;
}

// ── Error helper ──────────────────────────────────────────────────────

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Convert AuthError to NextResponse. Use in catch blocks of API routes. */
export function errorResponse(err: unknown) {
  if (err instanceof AuthError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error('[API]', err);
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
