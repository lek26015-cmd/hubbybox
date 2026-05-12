import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, timingSafeEqual } from 'crypto';

// Server-side only — never exposed to client
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'hubbyadmin';

// Simple session store (in production, use Redis or DB)
const activeSessions = new Map<string, { expiresAt: number }>();

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
      return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    // Clean up expired sessions periodically
    cleanExpiredSessions();

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
