import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const body = await req.json();

    // Support both schemas:
    // 1. Supplies order: { productId, productName, price, userId, orderId }
    // 2. Recall flow:    { items: [{ name, amount, quantity }], userId, orderId, metadata }
    const isRecallFlow = Array.isArray(body.items);

    const line_items = isRecallFlow
      ? body.items.map((item: { name: string; amount: number; quantity?: number }) => ({
          price_data: {
            currency: 'thb',
            product_data: { name: item.name },
            unit_amount: item.amount * 100,
          },
          quantity: item.quantity || 1,
        }))
      : [
          {
            price_data: {
              currency: 'thb',
              product_data: { name: body.productName },
              unit_amount: body.price * 100, // THB to Satang
            },
            quantity: 1,
          },
        ];

    const metadata: Record<string, string> = {
      orderId: body.orderId || '',
      userId: body.userId || '',
    };

    // Merge in recall-specific metadata if present
    if (isRecallFlow && body.metadata) {
      Object.entries(body.metadata).forEach(([key, value]) => {
        metadata[key] = String(value);
      });
    } else {
      metadata.productId = body.productId || '';
    }

    // Determine payment methods based on transaction type
    let paymentMethodTypes: ('card' | 'promptpay')[] = ['promptpay'];
    const transactionType = body.metadata?.type || '';
    
    if (transactionType === 'STORAGE_DEPOSIT') {
      paymentMethodTypes = ['card']; // บังคับตัดบัตรสำหรับค่าฝากรายเดือน
    } else if (transactionType === 'BOX_QUOTA' || transactionType === 'ITEM_RECALL') {
      paymentMethodTypes = ['promptpay']; // บังคับสแกนจ่ายสำหรับการซื้อขาด/ครั้งเดียว
    } else {
      paymentMethodTypes = ['promptpay', 'card']; // เผื่อกรณีอื่นๆ
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded' as any,
      payment_method_types: paymentMethodTypes,
      line_items,
      mode: 'payment',
      return_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${body.orderId}`,
      metadata,
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
