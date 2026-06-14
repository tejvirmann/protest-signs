import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 1 || amount > 10000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Donation to Sustain America LLC' },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/donate/success`,
      cancel_url: `${origin}/donate`,
      customer_creation: 'always',
      metadata: { type: 'donation' },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe donation checkout error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
