import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripe) return stripe;

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }

  stripe = new Stripe(apiKey, {
    apiVersion: '2025-01-27.acacia' as any,
  });

  return stripe;
}
