import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia' as any,
});

// Admin Supabase client (Service Role) to bypass RLS in webhooks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
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
        // Also ensure the box has a flag or status if needed
        await supabaseAdmin
          .from('boxes')
          .update({ status: 'partial_recall_pending' })
          .eq('id', boxId);
      }

      // If user checked "Save as Default", update their address book
      const isSaveDefault = metadata?.isSaveDefault === 'true';
      if (isSaveDefault) {
        const userId = session.client_reference_id || session.metadata?.userId;
        if (userId) {
          await supabaseAdmin
            .from('user_addresses')
            .insert({
              user_id: userId,
              label: 'ที่อยู่จากการเรียกคืน',
              recipient_name: metadata?.recipientName,
              address_line: metadata?.address,
              postcode: metadata?.postcode,
              phone: metadata?.phone,
              is_default: false // Let users manage defaults manually or keep current
            });
        }
      }
      
      console.log(`Recall items ${itemIds.join(', ')} marked as PAID & REQUESTED_RETURN`);
    } else if (orderId) {
      // Default: Supplies Order
      const { error } = await supabaseAdmin
        .from('supplies_orders')
        .update({ status: 'paid' })
        .eq('id', orderId);
        
      if (error) {
        console.error('Supabase supplies status update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      console.log(`Order ${orderId} successfully marked as PAID`);
    } else {
       console.warn('Checkout complete event MISSING orderId and type metadata');
    }
  }

  return NextResponse.json({ received: true });
}
