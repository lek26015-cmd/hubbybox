import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { to, message } = await req.json();
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json({ error: 'LINE_CHANNEL_ACCESS_TOKEN is not configured' }, { status: 500 });
    }

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing "to" or "message"' }, { status: 400 });
    }

    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to,
        messages: [{ type: 'text', text: message }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return NextResponse.json({ error: `LINE API error: ${res.status}`, detail: errBody }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
