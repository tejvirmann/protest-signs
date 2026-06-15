import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (
        quantity,
        price_at_purchase,
        signs ( title, images, weight_oz )
      )
    `
    )
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const stripeUrl = order.stripe_session_id
    ? `https://dashboard.stripe.com/${
        order.stripe_session_id.startsWith('cs_test_') ? 'test/' : ''
      }checkout/sessions/${order.stripe_session_id}`
    : null

  const totalWeightOz = order.order_items.reduce(
    (sum: number, item: any) => sum + (item.signs?.weight_oz ?? 0) * item.quantity,
    0
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/orders">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <Link href={`/admin/orders/${order.id}/packing-slip`} target="_blank">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Packing Slip
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(order.created_at).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Customer: {order.customer_email ?? 'N/A'}</p>
            {stripeUrl && (
              <a
                href={stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-black inline-flex items-center gap-1 mt-1"
              >
                View in Stripe <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{formatPrice(order.total)}</p>
            <span
              className={`inline-block mt-1 text-xs font-semibold rounded-full px-2 py-1 ${
                STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-2">Ship To</h2>
        {order.shipping_address_line1 ? (
          <div className="text-sm text-gray-700">
            <p>{order.shipping_name}</p>
            <p>{order.shipping_address_line1}</p>
            {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
            <p>
              {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
            </p>
            {order.shipping_phone && <p>Phone: {order.shipping_phone}</p>}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            No shipping address on file (order placed before shipping collection was enabled)
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-4">Items</h2>
        <ul className="divide-y">
          {order.order_items.map((item: any, i: number) => (
            <li key={i} className="flex items-center gap-4 py-4">
              <div className="relative w-20 h-20 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                {item.signs?.images?.[0] && (
                  <Image
                    src={item.signs.images[0]}
                    alt={item.signs.title ?? ''}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.signs?.title ?? 'Sign'}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                <p className="text-sm text-gray-500">
                  {item.signs?.weight_oz != null
                    ? `${item.signs.weight_oz} oz each`
                    : 'Weight not set'}
                </p>
              </div>
              <p className="font-medium">{formatPrice(item.price_at_purchase * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="border-t pt-4 mt-2 flex justify-between items-center text-sm text-gray-600">
          <span>Total package weight</span>
          <span>{totalWeightOz} oz</span>
        </div>
      </div>
    </div>
  )
}
