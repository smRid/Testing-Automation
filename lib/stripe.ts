import Stripe from 'stripe';

let stripe: Stripe | undefined;

export function getStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }

  stripe ??= new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16' as any,
    typescript: true,
  });

  return stripe;
}

export function getStripeWebhookSecret() {
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeWebhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET');
  }

  return stripeWebhookSecret;
}
