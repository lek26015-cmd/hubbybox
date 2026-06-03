import { getServiceSupabase } from '@/lib/supabase-service';

export const runtime = 'nodejs';
export const revalidate = 3600; // Cache for 1 hour

/**
 * GET /api/stats
 * 
 * Returns platform-wide stats for the landing page.
 * Uses service role to count across all users.
 * Response is cached for 1 hour via revalidate.
 */
export async function GET() {
  try {
    const sb = getServiceSupabase();

    const [usersRes, itemsRes, boxesRes] = await Promise.all([
      sb.from('users').select('*', { count: 'exact', head: true }),
      sb.from('items').select('*', { count: 'exact', head: true }),
      sb.from('boxes').select('*', { count: 'exact', head: true }),
    ]);

    return Response.json({
      users: usersRes.count ?? 0,
      items: itemsRes.count ?? 0,
      boxes: boxesRes.count ?? 0,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('[Stats API]', err);
    // Return fallback zeros on error – landing page will show defaults
    return Response.json({ users: 0, items: 0, boxes: 0 });
  }
}
