import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getServiceSupabase } from '@/lib/supabase-service';
import type Stripe from 'stripe';

export async function POST(req: Request) {
  const stripe = getStripe();
  const supabaseAdmin = getServiceSupabase();
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook match error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;
    const orderId = metadata?.orderId;
    const type = metadata?.type;
    const userId = metadata?.userId;
    
    // ──────────────────────────────────────────────
    // 1. ITEM_RECALL — เรียกคืนของรายชิ้นจากคลัง
    // ──────────────────────────────────────────────
    if (type === 'ITEM_RECALL') {
      const itemIds = metadata?.itemIds?.split(',') || [];
      const boxId = metadata?.boxId;

      if (itemIds.length > 0) {
        const { error } = await supabaseAdmin
          .from('items')
          .update({ status: 'requested_return' })
          .in('id', itemIds);

        if (error) {
          console.error('Supabase item status update error:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }

      if (boxId) {
        await supabaseAdmin
          .from('boxes')
          .update({ status: 'partial_recall_pending' })
          .eq('id', boxId);
      }

      // If user checked "Save as Default", update their address book
      const isSaveDefault = metadata?.isSaveDefault === 'true';
      if (isSaveDefault && userId) {
        await supabaseAdmin
          .from('user_addresses')
          .insert({
            user_id: userId,
            label: 'ที่อยู่จากการเรียกคืน',
            recipient_name: metadata?.recipientName,
            address_line: metadata?.address,
            postcode: metadata?.postcode,
            phone: metadata?.phone,
            is_default: false
          });
      }
      
      console.log(`[ITEM_RECALL] Items ${metadata?.itemIds} marked as REQUESTED_RETURN`);

    // ──────────────────────────────────────────────
    // 2. BOX_QUOTA — ซื้อกล่องดิจิทัลเพิ่ม (Premium)
    // ──────────────────────────────────────────────
    } else if (type === 'BOX_QUOTA') {
      const quotaAmount = parseInt(metadata?.quotaAmount || '0', 10);

      if (userId && quotaAmount > 0) {
        // Fetch current quota
        const { data: user, error: fetchErr } = await supabaseAdmin
          .from('users')
          .select('box_quota')
          .eq('id', userId)
          .single();

        if (fetchErr) {
          console.error('Fetch user quota error:', fetchErr);
          return NextResponse.json({ error: fetchErr.message }, { status: 500 });
        }

        const currentQuota = user?.box_quota || 3;
        const newQuota = currentQuota + quotaAmount;

        const { error: updateErr } = await supabaseAdmin
          .from('users')
          .update({ box_quota: newQuota })
          .eq('id', userId);

        if (updateErr) {
          console.error('Update quota error:', updateErr);
          return NextResponse.json({ error: updateErr.message }, { status: 500 });
        }

        console.log(`[BOX_QUOTA] User ${userId} quota updated: ${currentQuota} → ${newQuota} (+${quotaAmount})`);
      } else {
        console.warn(`[BOX_QUOTA] Missing userId or quotaAmount: userId=${userId}, quotaAmount=${quotaAmount}`);
      }

    // ──────────────────────────────────────────────
    // 3. STORAGE_DEPOSIT — ฝากกล่องเข้าคลัง
    // ──────────────────────────────────────────────
    } else if (type === 'STORAGE_DEPOSIT') {
      const boxIds = metadata?.boxIds?.split(',') || [];
      const carrier = metadata?.carrier || '';
      const trackingNumber = metadata?.trackingNumber || '';

      if (boxIds.length > 0 && userId) {
        const { error } = await supabaseAdmin
          .from('boxes')
          .update({
            location: 'คลังกลาง HubbyBox',
            status: 'shipping_to_warehouse',
            shipping_carrier: carrier,
            tracking_number: trackingNumber || null,
          })
          .in('id', boxIds)
          .eq('user_id', userId);

        if (error) {
          console.error('Storage deposit update error:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`[STORAGE_DEPOSIT] ${boxIds.length} boxes marked as SHIPPING_TO_WAREHOUSE for user ${userId}`);
      } else {
        console.warn(`[STORAGE_DEPOSIT] Missing boxIds or userId`);
      }

    // ──────────────────────────────────────────────
    // 4. SUPPORT — เลี้ยงขนมทีมงาน (Donate)
    // ──────────────────────────────────────────────
    } else if (type === 'SUPPORT') {
      // ไม่ต้องอัพเดทฐานข้อมูลใดๆ แค่เก็บ Log ว่าได้เงินสนับสนุน
      console.log(`[SUPPORT] Received donation of ${session.amount_total ? session.amount_total / 100 : 0} THB! Thank you 💖`);

    // ──────────────────────────────────────────────
    // 5. Default — Supplies Order (สั่งซื้อชุดกล่อง)
    // ──────────────────────────────────────────────
    } else if (orderId) {
      const { error } = await supabaseAdmin
        .from('supplies_orders')
        .update({ status: 'paid' })
        .eq('id', orderId);
        
      if (error) {
        console.error('Supabase supplies status update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      console.log(`[SUPPLIES] Order ${orderId} marked as PAID`);
    } else {
       console.warn(`[WEBHOOK] Unhandled checkout session. Type: ${type}, OrderID: ${orderId}`);
    }
  }

  return NextResponse.json({ received: true });
}
