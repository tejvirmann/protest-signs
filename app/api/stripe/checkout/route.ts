import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { computeBagPrice, getPaperShipping, getPaperUnitPrice, type PricingTier } from '@/lib/pricing'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { items } = await request.json()
    if (!items || items.length === 0) return NextResponse.json({ error: 'No items provided' }, { status: 400 })

    // Fetch sign details
    const signIds = items.map((item: any) => item.sign_id)
    const { data: signs } = await adminClient
      .from('signs')
      .select('*')
      .in('id', signIds)
      .is('archived_at', null)

    if (!signs || signs.length !== items.length) return NextResponse.json({ error: 'Invalid items' }, { status: 400 })

    // Validate stock
    for (const item of items) {
      const sign = signs.find((s) => s.id === item.sign_id)
      if (!sign || sign.quantity_available < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${sign?.title || 'item'}` }, { status: 400 })
      }
    }

    // Fetch pricing tiers from DB
    const { data: tiers } = await adminClient
      .from('pricing_tiers')
      .select('*')
      .order('product_type')
      .order('display_order')

    const pricingTiers: PricingTier[] = tiers ?? []

    // Separate bag and paper items
    const bagItems = items.filter((item: any) => {
      const sign = signs.find((s) => s.id === item.sign_id)
      return sign?.product_type === 'bag'
    })
    const paperItems = items.filter((item: any) => {
      const sign = signs.find((s) => s.id === item.sign_id)
      return sign?.product_type !== 'bag'
    })

    const lineItems: any[] = []

    // Bag bundle line item (all bags priced together)
    if (bagItems.length > 0) {
      const totalBagQty = bagItems.reduce((sum: number, i: any) => sum + i.quantity, 0)
      const bagBundlePrice = pricingTiers.length > 0
        ? computeBagPrice(totalBagQty, pricingTiers)
        : bagItems.reduce((sum: number, i: any) => {
            const sign = signs.find((s) => s.id === i.sign_id)!
            return sum + sign.price * i.quantity
          }, 0)

      const bagNames = bagItems.map((i: any) => {
        const sign = signs.find((s) => s.id === i.sign_id)!
        return i.quantity > 1 ? `${sign.title} ×${i.quantity}` : sign.title
      }).join(', ')

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Bag Signs Bundle (${totalBagQty} bag${totalBagQty !== 1 ? 's' : ''})`,
            description: bagNames,
          },
          unit_amount: bagBundlePrice,
        },
        quantity: 1,
      })
    }

    // Paper sign line items (per sign)
    const paperUnitPrice = getPaperUnitPrice(pricingTiers)
    for (const item of paperItems) {
      const sign = signs.find((s) => s.id === item.sign_id)!
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: sign.title,
            description: sign.description || undefined,
            images: sign.images.slice(0, 1),
          },
          unit_amount: paperUnitPrice,
        },
        quantity: item.quantity,
      })
    }

    // Flat shipping for paper signs
    if (paperItems.length > 0) {
      const shippingAmount = getPaperShipping(pricingTiers)
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Paper Sign Shipping (flat rate)' },
          unit_amount: shippingAmount,
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      metadata: {
        user_id: user.id,
        items: JSON.stringify(items),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
