import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { resend } from '@/lib/resend'
import { formatPrice } from '@/lib/utils'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any

    // Donations don't create an order — just a one-off payment, visible in Stripe's
    // payments dashboard.
    if (session.metadata?.type === 'donation') {
      return NextResponse.json({ received: true })
    }

    const userId = session.metadata.user_id ?? null
    const items = JSON.parse(session.metadata.items)

    const shipping = session.collected_information?.shipping_details
    const address = shipping?.address

    // Create order (user_id is null for guest checkouts)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        ...(userId ? { user_id: userId } : {}),
        stripe_session_id: session.id,
        status: 'completed',
        total: session.amount_total,
        customer_email: session.customer_details?.email ?? null,
        shipping_name: shipping?.name ?? null,
        shipping_phone: session.customer_details?.phone ?? null,
        shipping_address_line1: address?.line1 ?? null,
        shipping_address_line2: address?.line2 ?? null,
        shipping_city: address?.city ?? null,
        shipping_state: address?.state ?? null,
        shipping_postal_code: address?.postal_code ?? null,
        shipping_country: address?.country ?? null,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Failed to create order from webhook:', orderError)
    }

    if (order) {
      // Create order items and update inventory
      const emailItems: { title: string; quantity: number; priceAtPurchase: number }[] = []

      for (const item of items) {
        const { data: sign } = await supabase
          .from('signs')
          .select('title, price, quantity_available')
          .eq('id', item.sign_id)
          .single()

        if (sign) {
          // Insert order item
          await supabase.from('order_items').insert({
            order_id: order.id,
            sign_id: item.sign_id,
            quantity: item.quantity,
            price_at_purchase: sign.price,
          })

          // Update inventory
          await supabase
            .from('signs')
            .update({
              quantity_available: Math.max(0, sign.quantity_available - item.quantity),
            })
            .eq('id', item.sign_id)

          emailItems.push({ title: sign.title, quantity: item.quantity, priceAtPurchase: sign.price })
        }
      }

      // Clear logged-in user's cart (guest carts are cleared client-side on success page)
      if (userId) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .in(
            'sign_id',
            items.map((i: any) => i.sign_id)
          )
      }

      // Send order confirmation email
      if (order.customer_email) {
        const reference = order.id.slice(0, 8).toUpperCase()

        const itemRows = emailItems
          .map(
            (i) => `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${i.title}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(i.priceAtPurchase * i.quantity)}</td>
              </tr>`
          )
          .join('')

        const shippingHtml = address
          ? `
            <p style="margin: 4px 0;">${shipping?.name ?? ''}</p>
            <p style="margin: 4px 0;">${address.line1}${address.line2 ? `, ${address.line2}` : ''}</p>
            <p style="margin: 4px 0;">${address.city}, ${address.state} ${address.postal_code}</p>`
          : ''

        try {
          await resend.emails.send({
            from: 'Protest Signs <onboarding@resend.dev>',
            to: order.customer_email,
            subject: `Order Confirmation #${reference} — Protest Signs`,
            html: `
              <h2>Thanks for your order!</h2>
              <p>Order #${reference} — placed ${new Date(order.created_at).toLocaleDateString()}</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <thead>
                  <tr>
                    <th style="text-align: left; border-bottom: 2px solid #000; padding: 8px 0;">Item</th>
                    <th style="text-align: center; border-bottom: 2px solid #000; padding: 8px 0;">Qty</th>
                    <th style="text-align: right; border-bottom: 2px solid #000; padding: 8px 0;">Price</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
              <p style="text-align: right; font-weight: bold; font-size: 1.1em;">Total: ${formatPrice(order.total)}</p>
              ${shippingHtml ? `<h3>Shipping to</h3>${shippingHtml}` : ''}
              <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
              <p><small>Questions about your order? Reply to this email or contact us at sustainamericallc@gmail.com.</small></p>
            `,
          })
        } catch (emailError) {
          console.error('Failed to send order confirmation email:', emailError)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
