import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { PrintButton } from './print-button'

export const dynamic = 'force-dynamic'

export default async function PackingSlipPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        quantity,
        price_at_purchase,
        signs ( title )
      )
    `)
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const reference = order.id.slice(0, 8).toUpperCase()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href="/admin/orders">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white rounded-lg shadow p-8 print:shadow-none print:p-0">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">Packing Slip</h1>
            <p className="text-sm text-gray-600 mt-1">Order #{reference}</p>
            <p className="text-sm text-gray-600">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <p className="font-semibold">Sustain America LLC</p>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Ship To
          </h2>
          {order.shipping_address_line1 ? (
            <div className="text-sm">
              <p className="font-medium">{order.shipping_name}</p>
              <p>{order.shipping_address_line1}</p>
              {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
              <p>
                {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No shipping address on file</p>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Items
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item: any, i: number) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{item.signs?.title}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">{formatPrice(item.price_at_purchase)}</td>
                  <td className="py-2 text-right">
                    {formatPrice(item.price_at_purchase * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="text-2xl font-bold">{formatPrice(order.total)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
