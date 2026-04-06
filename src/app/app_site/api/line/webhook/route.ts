import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { geminiListItemsFromImage } from '@/lib/gemini-image-items';
import {
  ensureUserByLineId,
  ensureLineChatBox,
  createNamedBox,
  listBoxesLines,
  getLatestBoxId,
  addItemsToBox,
  parseItemNamesFromGemini,
  LINE_CHAT_BOX_NAME,
} from '@/lib/line-chat-service';

export const runtime = 'nodejs';

const HELP_TEXT = `HubbyBox — จัดการกล่องจากแชท

ส่งรูปภาพ
• AI จะเดาว่าเป็นของอะไร แล้วใส่ในกล่อง "${LINE_CHAT_BOX_NAME}"

พิมพ์คำสั่ง
• สร้างกล่อง ชื่อที่ต้องการ
• เพิ่ม ชื่อของ หรือ หลายชิ้น คั่นด้วย ,
• กล่อง — ดูรายการกล่อง
• ช่วยเหลือ — ข้อความนี้

เปิดแอปเต็มรูปแบบได้จากเมนู LIFF ของบอท`;

function verifyLineSignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const hash = createHmac('sha256', secret).update(body, 'utf8').digest('base64');
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

async function lineReply(replyToken: string, texts: string[]): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error('ไม่มี LINE_CHANNEL_ACCESS_TOKEN');

  const messages = texts.filter(Boolean).map((t) => ({
    type: 'text' as const,
    text: t.slice(0, 4900),
  }));
  if (!messages.length) return;

  const res = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    console.error('[LINE] reply failed', res.status, errBody);
  }
}

async function fetchLineImage(messageId: string): Promise<{ buffer: ArrayBuffer; mime: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error('ไม่มี LINE_CHANNEL_ACCESS_TOKEN');
  const res = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`ดาวน์โหลดรูปจาก LINE ไม่ได้ (${res.status})`);
  }
  const mime = res.headers.get('content-type') || 'image/jpeg';
  const buffer = await res.arrayBuffer();
  return { buffer, mime };
}

async function handleTextMessage(lineUserId: string, text: string, replyToken: string): Promise<void> {
  const t = text.trim();

  if (/^(ช่วยเหลือ|help|ห)$/iu.test(t)) {
    await lineReply(replyToken, [HELP_TEXT]);
    return;
  }

  if (/^(กล่อง|รายการกล่อง|list)$/iu.test(t)) {
    const user = await ensureUserByLineId(lineUserId);
    const lines = await listBoxesLines(user.id);
    await lineReply(replyToken, ['กล่องของคุณ:', lines]);
    return;
  }

  const createMatch = t.match(/^สร้างกล่อง\s*(.+)$/u);
  if (createMatch) {
    const name = createMatch[1].trim();
    if (!name) {
      await lineReply(replyToken, ['ระบุชื่อกล่องหลังคำว่า "สร้างกล่อง" ด้วยนะ เช่น สร้างกล่อง ของในห้องนอน']);
      return;
    }
    const user = await ensureUserByLineId(lineUserId);
    const box = await createNamedBox(user.id, name);
    await lineReply(replyToken, [`สร้างกล่อง "${name}" แล้ว (รหัส ${box.id.slice(0, 8)}…)`]);
    return;
  }

  const addMatch = t.match(/^เพิ่ม\s*(.+)$/u);
  if (addMatch) {
    const names = addMatch[1]
      .split(/[,，、]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!names.length) {
      await lineReply(replyToken, ['ระบุชื่อของหลัง "เพิ่ม" เช่น เพิ่ม กุญแจรถ']);
      return;
    }
    const user = await ensureUserByLineId(lineUserId);
    let boxId = await getLatestBoxId(user.id);
    if (!boxId) {
      const box = await ensureLineChatBox(user.id);
      boxId = box.id;
    }
    const n = await addItemsToBox(boxId, names, null);
    await lineReply(replyToken, [`เพิ่ม ${n} รายการในกล่องล่าสุดแล้ว`]);
    return;
  }

  await lineReply(replyToken, [
    'ยังไม่เข้าใจข้อความนี้ พิมพ์ "ช่วยเหลือ" หรือส่งรูปมาวิเคราะห์ของในกล่องได้',
  ]);
}

async function handleImageMessage(lineUserId: string, messageId: string, replyToken: string): Promise<void> {
  await lineReply(replyToken, ['รับรูปแล้ว กำลังวิเคราะห์…']);
  try {
    const user = await ensureUserByLineId(lineUserId);
    const { buffer, mime } = await fetchLineImage(messageId);
    const raw = await geminiListItemsFromImage(buffer, mime);
    const items = parseItemNamesFromGemini(raw);
    if (!items.length) {
      await linePushText(
        lineUserId,
        'ไม่พบรายการของจากภาพ ลองส่งรูปใหม่หรือถ่ายให้ชัดขึ้น'
      );
      return;
    }
    const box = await ensureLineChatBox(user.id);
    const n = await addItemsToBox(box.id, items, null);
    await linePushText(
      lineUserId,
      `วิเคราะห์ได้: ${items.slice(0, 8).join(', ')}${items.length > 8 ? ' …' : ''}\nใส่ในกล่อง "${LINE_CHAT_BOX_NAME}" แล้ว ${n} รายการ`
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    await linePushText(lineUserId, `ขออภัย ประมวลผลรูปไม่สำเร็จ: ${msg}`);
  }
}

/** ใช้ push หลังใช้ replyToken ไปแล้ว (แชทรูป) */
async function linePushText(to: string, text: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to,
      messages: [{ type: 'text', text: text.slice(0, 4900) }],
    }),
  });
}

async function handleEvent(event: Record<string, unknown>): Promise<void> {
  const type = event.type as string;
  if (type === 'follow') {
    const replyToken = event.replyToken as string | undefined;
    if (replyToken) await lineReply(replyToken, ['สวัสดีครับ! ลองพิมพ์ "ช่วยเหลือ" หรือส่งรูปของเข้ามาได้เลย', HELP_TEXT]);
    return;
  }

  if (type !== 'message') return;

  const msg = event.message as Record<string, unknown> | undefined;
  const replyToken = event.replyToken as string;
  const source = event.source as { userId?: string } | undefined;
  const lineUserId = source?.userId;
  if (!lineUserId || !replyToken) return;

  const msgType = msg?.type as string | undefined;
  if (msgType === 'text' && typeof msg?.text === 'string') {
    await handleTextMessage(lineUserId, msg.text, replyToken);
    return;
  }

  if (msgType === 'image' && typeof msg?.id === 'string') {
    await handleImageMessage(lineUserId, msg.id, replyToken);
  }
}

export async function POST(req: Request) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) {
    console.error('[LINE] LINE_CHANNEL_SECRET missing');
    return NextResponse.json({ error: 'server misconfigured' }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-line-signature');

  if (!verifyLineSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let payload: { events?: Record<string, unknown>[] };
  try {
    payload = JSON.parse(rawBody) as { events?: Record<string, unknown>[] };
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  const events = payload.events ?? [];
  for (const ev of events) {
    try {
      await handleEvent(ev);
    } catch (e) {
      console.error('[LINE] event handler error', e);
    }
  }

  return NextResponse.json({ ok: true });
}
