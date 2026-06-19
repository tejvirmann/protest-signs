import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { buildUspsCsv, type UspsOrder } from '@/lib/usps-csv'

const adminClient = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const ids = searchParams.get('ids')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const status = searchParams.get('status')
  const customer = searchParams.get('customer')

  let query = adminClient
    .from('orders')
    .select(`
      id,
      customer_email,
      shipping_name,
      shipping_phone,
      shipping_address_line1,
      shipping_address_line2,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      order_items (
        quantity,
        price_at_purchase,
        signs ( title, weight_oz )
      )
    `)
    .not('shipping_address_line1', 'is', null)

  if (ids) {
    const idList = ids.split(',').map((s) => s.trim()).filter(Boolean)
    query = query.in('id', idList)
  } else {
    // Default export = orders that still need to ship, unless a status or
    // date range is given (in which case Buck likely wants a record of
    // everything matching that filter, regardless of status).
    if (status) {
      query = query.eq('status', status)
    } else if (!from && !to) {
      query = query.eq('status', 'in_progress')
    }
    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', `${to}T23:59:59.999Z`)
    if (customer) query = query.ilike('customer_email', `%${customer}%`)
  }

  const { data: orders, error } = await query.order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const uspsOrders: UspsOrder[] = (orders ?? []).map((order: any) => ({
    id: order.id,
    customerEmail: order.customer_email,
    shippingName: order.shipping_name,
    shippingPhone: order.shipping_phone,
    addressLine1: order.shipping_address_line1,
    addressLine2: order.shipping_address_line2,
    city: order.shipping_city,
    state: order.shipping_state,
    postalCode: order.shipping_postal_code,
    items: (order.order_items ?? []).map((item: any) => ({
      title: item.signs?.title ?? 'Sign',
      quantity: item.quantity,
      weightOz: item.signs?.weight_oz ?? null,
      priceAtPurchaseCents: item.price_at_purchase,
    })),
  }))

  const csv = buildUspsCsv(uspsOrders, {
    name: process.env.USPS_SENDER_NAME ?? '',
    addressLine1: process.env.USPS_SENDER_ADDRESS_LINE1 ?? '',
    addressLine2: process.env.USPS_SENDER_ADDRESS_LINE2 ?? '',
    city: process.env.USPS_SENDER_CITY ?? '',
    state: process.env.USPS_SENDER_STATE ?? '',
    zip: process.env.USPS_SENDER_ZIP ?? '',
    email: process.env.USPS_SENDER_EMAIL ?? '',
    phone: process.env.USPS_SENDER_PHONE ?? '',
  })

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="usps-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
