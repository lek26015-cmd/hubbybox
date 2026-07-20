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

    // Determine payment method based on transaction type
    const transactionType = body.metadata?.type || '';
    const useCard = transactionType === 'STORAGE_DEPOSIT';

    // Calculate total amount in satang (THB * 100)
    const totalAmount = isRecallFlow
      ? body.items.reduce(
          (sum: number, item: { amount: number; quantity?: number }) =>
            sum + item.amount * 100 * (item.quantity || 1),
          0
        )
      : body.price * 100;

    const productDescription = isRecallFlow
      ? body.items.map((i: { name: string }) => i.name).join(', ')
      : body.productName || 'HubbyBox Payment';

    if (useCard) {
      // ── Card Flow: Use Stripe Checkout Session (existing flow) ──
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
                unit_amount: body.price * 100,
              },
              quantity: 1,
            },
          ];

      const session = await stripe.checkout.sessions.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ui_mode: 'embedded' as any,
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        customer_email: `${body.userId || body.metadata?.userId || 'user'}@hubbybox.app`,
        return_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${body.orderId}`,
        metadata,
      });

      return NextResponse.json({
        mode: 'card',
        clientSecret: session.client_secret,
      });
    } else {
      // ── PromptPay Flow: Use PaymentIntent directly → get QR immediately ──
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: 'thb',
        payment_method_types: ['promptpay'],
        payment_method_data: {
          type: 'promptpay',
          billing_details: {
            email: `${body.userId || body.metadata?.userId || 'user'}@hubbybox.app`,
          },
        },
        confirm: true,
        description: productDescription,
        metadata,
        return_url: `${req.headers.get('origin')}/checkout/success?order_id=${body.orderId}`,
      });

      // Extract QR code from next_action
      const nextAction = paymentIntent.next_action;
      const qrCode = nextAction?.promptpay_display_qr_code;

      if (!qrCode) {
        throw new Error('Failed to generate PromptPay QR code');
      }

      return NextResponse.json({
        mode: 'promptpay',
        paymentIntentId: paymentIntent.id,
        qrCodeUrl: qrCode.image_url_png,
        qrCodeSvg: qrCode.image_url_svg,
        amount: totalAmount / 100, // back to THB
        productName: productDescription,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
