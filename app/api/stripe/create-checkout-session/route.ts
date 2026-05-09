import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPlanById } from '../../../../lib/plans';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  return new Stripe(key, {
    apiVersion: '2026-04-22.dahlia',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, planId } = body;

    // Resolve the Stripe price ID — prefer explicit priceId from client, fall back to plan lookup
    let resolvedPriceId: string | undefined;

    if (priceId) {
      resolvedPriceId = priceId;
    } else if (planId) {
      const plan = getPlanById(planId);
      if (!plan) {
        return NextResponse.json({ error: '计划未找到' }, { status: 404 });
      }
      // Map our plan IDs to Stripe price IDs via environment variables
      resolvedPriceId =
        plan.id === 'plan_monthly'
          ? process.env.STRIPE_MONTHLY_PRICE_ID
          : process.env.STRIPE_YEARLY_PRICE_ID;

      if (!resolvedPriceId) {
        return NextResponse.json(
          { error: `Stripe 价格 ID 未配置: ${plan.name}` },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({ error: '缺少 priceId 或 planId' }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: resolvedPriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        planId: planId || '',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '创建 Checkout Session 失败';
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
