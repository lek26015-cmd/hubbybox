import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function GET(req: Request) {
  try {
    const stripe = getStripe();
    const url = new URL(req.url);
    const paymentIntentId = url.searchParams.get('id');

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing payment intent ID' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      status: paymentIntent.status,
      orderId: paymentIntent.metadata?.orderId || '',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Status check error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
