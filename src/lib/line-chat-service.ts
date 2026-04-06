import { getServiceSupabase } from '@/lib/supabase-service';

export const LINE_CHAT_BOX_NAME = 'กล่องจาก LINE';

export async function ensureUserByLineId(lineUserId: string): Promise<{ id: string }> {
  const sb = getServiceSupabase();
  const { data: existing, error: selErr } = await sb
    .from('users')
    .select('id')
    .eq('line_user_id', lineUserId)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing;

  const { data: created, error: insErr } = await sb
    .from('users')
    .insert({ line_user_id: lineUserId })
    .select('id')
    .single();
  if (insErr) throw insErr;
  return created;
}

export async function ensureLineChatBox(userId: string): Promise<{ id: string }> {
  const sb = getServiceSupabase();
  const { data: existing, error: selErr } = await sb
    .from('boxes')
    .select('id')
    .eq('user_id', userId)
    .eq('name', LINE_CHAT_BOX_NAME)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing;

  const { data: created, error: insErr } = await sb
    .from('boxes')
    .insert({
      user_id: userId,
      name: LINE_CHAT_BOX_NAME,
      location: 'ที่บ้าน',
    })
    .select('id')
    .single();
  if (insErr) throw insErr;
  return created;
}

export async function createNamedBox(userId: string, name: string): Promise<{ id: string }> {
  const sb = getServiceSupabase();
  const { data, error } = await sb
    .from('boxes')
    .insert({
      user_id: userId,
      name: name.trim(),
      location: 'ที่บ้าน',
    })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function listBoxesLines(userId: string): Promise<string> {
  const sb = getServiceSupabase();
  const { data, error } = await sb
    .from('boxes')
    .select('id, name, location')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(15);
  if (error) throw error;
  if (!data?.length) return 'ยังไม่มีกล่อง — พิมพ์ "สร้างกล่อง ชื่อ..." หรือส่งรูปมาได้เลย';
  return data
    .map((b, i) => `${i + 1}. ${b.name} (${(b.id as string).slice(0, 8)}…)`)
    .join('\n');
}

export async function getLatestBoxId(userId: string): Promise<string | null> {
  const sb = getServiceSupabase();
  const { data, error } = await sb
    .from('boxes')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function addItemsToBox(
  boxId: string,
  itemNames: string[],
  imageUrl: string | null
): Promise<number> {
  const sb = getServiceSupabase();
  let n = 0;
  for (const name of itemNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const { error } = await sb.from('items').insert({
      box_id: boxId,
      name: trimmed,
      image_url: imageUrl,
    });
    if (!error) n++;
  }
  return n;
}

export function parseItemNamesFromGemini(text: string): string[] {
  return text
    .split(/[,，、]/)
    .map((s) => s.replace(/^[\d.\-\s]+/, '').trim())
    .filter(Boolean);
}
