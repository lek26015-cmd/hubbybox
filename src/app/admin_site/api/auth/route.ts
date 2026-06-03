import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, timingSafeEqual } from 'crypto';

// Server-side only — never exposed to client
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'hubbyadmin';

// Simple session store (in production, use Redis or DB)
const activeSessions = new Map<string, { expiresAt: number }>();

// ── Rate Limiting ─────────────────────────────────────────────────────
// Max 5 failed attempts per IP within a 15-minute window.
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

type RateLimitEntry = { attempts: number; firstAttemptAt: number };
const loginAttempts = new Map<string, RateLimitEntry>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** Returns true if the IP is rate-limited (too many failed attempts). */
function isRateLimited(ip: string): boolean {
  const entry = loginAttempts.get(ip);
  if (!entry) return false;

  // Window expired — reset
  if (Date.now() - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }

  return entry.attempts >= RATE_LIMIT_MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(ip, { attempts: 1, firstAttemptAt: now });
  } else {
    entry.attempts++;
  }
}

function clearFailedAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

/** Periodically prune expired rate-limit entries to prevent memory growth. */
function cleanRateLimitEntries(): void {
  const now = Date.now();
  for (const [ip, entry] of loginAttempts) {
    if (now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
      loginAttempts.delete(ip);
    }
  }
}
// ──────────────────────────────────────────────────────────────────────

function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of activeSessions) {
    if (session.expiresAt < now) {
      activeSessions.delete(token);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // Rate-limit check BEFORE parsing body
    if (isRateLimited(ip)) {
      console.warn(`[ADMIN AUTH] Rate-limited login attempt from IP: ${ip}`);
      const entry = loginAttempts.get(ip);
      const retryAfterSec = entry
        ? Math.ceil((RATE_LIMIT_WINDOW_MS - (Date.now() - entry.firstAttemptAt)) / 1000)
        : RATE_LIMIT_WINDOW_MS / 1000;
      return NextResponse.json(
        { error: `ล็อกอินผิดหลายครั้ง กรุณารอ ${Math.ceil(retryAfterSec / 60)} นาทีแล้วลองใหม่` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { passcode } = body;

    if (!passcode || typeof passcode !== 'string') {
      return NextResponse.json({ error: 'กรุณาใส่รหัสผ่าน' }, { status: 400 });
    }

    // Timing-safe comparison to prevent timing attacks
    const passcodeBuffer = Buffer.from(passcode);
    const expectedBuffer = Buffer.from(ADMIN_PASSCODE);

    const isValid =
      passcodeBuffer.length === expectedBuffer.length &&
      timingSafeEqual(passcodeBuffer, expectedBuffer);

    if (!isValid) {
      recordFailedAttempt(ip);
      const entry = loginAttempts.get(ip);
      const remaining = RATE_LIMIT_MAX_ATTEMPTS - (entry?.attempts ?? 0);
      console.warn(`[ADMIN AUTH] Failed login from IP: ${ip} (${remaining} attempts remaining)`);
      return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    // Successful login — clear rate-limit counter for this IP
    clearFailedAttempts(ip);

    // Clean up expired sessions periodically
    cleanExpiredSessions();
    cleanRateLimitEntries();

    // Generate session token
    const token = generateSessionToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    activeSessions.set(token, { expiresAt });

    const response = NextResponse.json({ success: true });

    // Set HttpOnly cookie — cannot be accessed from JavaScript
    response.cookies.set('hubby_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Validate session
  const token = req.cookies.get('hubby_admin_session')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  cleanExpiredSessions();
  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    activeSessions.delete(token || '');
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('hubby_admin_session')?.value;
  if (token) activeSessions.delete(token);

  const response = NextResponse.json({ success: true });
  response.cookies.delete('hubby_admin_session');
  return response;
}
