import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb, DbInstance } from '../../../../lib/db';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  return new Stripe(key, {
    apiVersion: '2026-04-22.dahlia',
  });
}

function getWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || '';
}

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')!;
  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = getStripe().webhooks.constructEvent(body, sig, getWebhookSecret());
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: '签名验证失败' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }

    default: {
      // Unexpected event type — log but return 200 to avoid retries
      console.log(`未处理的事件类型: ${event.type}`);
      break;
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const db = getDb() as unknown as DbInstance & { exec: (sql: string) => void; prepare: (sql: string) => { run: (...args: unknown[]) => void } };

  // Create subscriptions table if it doesn't exist (idempotent)
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      stripe_customer_id TEXT NOT NULL,
      stripe_subscription_id TEXT,
      plan_id TEXT,
      status TEXT DEFAULT 'active',
      current_period_end INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const subscriptionId = session.subscription;
  if (!subscriptionId) {
    console.log(`Checkout session ${session.id} has no subscription`);
    return;
  }

  // Fetch the actual subscription to get details
  const subResponse = await getStripe().subscriptions.retrieve(subscriptionId as string);
  const subscription = subResponse as unknown as Stripe.Subscription;

  // Extract user_id from session metadata (set by frontend during checkout)
  const userId = session.metadata?.userId || `cus_${(subscription.customer as string)}`;
  const planId = session.metadata?.planId || '';

  db.prepare(`
    INSERT OR REPLACE INTO subscriptions 
      (id, user_id, stripe_customer_id, stripe_subscription_id, plan_id, status, current_period_end)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    subscription.id,
    userId,
    subscription.customer as string,
    subscription.id,
    planId,
    subscription.status,
    (subscription as unknown as { current_period_end?: number }).current_period_end?.toString() || '0'
  );

  console.log(`订阅已创建: ${subscription.id}, 用户: ${userId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const db = getDb() as unknown as DbInstance & { exec: (sql: string) => void; prepare: (sql: string) => { run: (...args: unknown[]) => void } };

  // Ensure subscriptions table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      stripe_customer_id TEXT NOT NULL,
      stripe_subscription_id TEXT,
      plan_id TEXT,
      status TEXT DEFAULT 'active',
      current_period_end INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Update existing subscription record
  db.prepare(`
    UPDATE subscriptions 
    SET status = ?, current_period_end = ?, updated_at = datetime('now')
    WHERE stripe_subscription_id = ?
  `).run(
    subscription.status,
    (subscription as unknown as { current_period_end?: number }).current_period_end?.toString() || '0',
    subscription.id
  );

  console.log(`订阅已更新: ${subscription.id}, 状态: ${subscription.status}`);
}
