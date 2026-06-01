import { NextResponse } from 'next/server';
import { getStripe, getStripeWebhookSecret } from '@/lib/stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      getStripeWebhookSecret()
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Fulfill purchase in your database
      console.log(`Payment successful for checkout session: ${session.id}`);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
