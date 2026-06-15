'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink, FileText, AlertCircle } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUS_OPTIONS = ['completed', 'shipped', 'cancelled']

interface Order {
  id: string
  created_at: string
  customer_email: string | null
  total: number
  status: string
  stripe_session_id: string | null
  shipping_name: string | null
  shipping_address_line1: string | null
  shipping_address_line2: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_postal_code: string | null
  shipping_phone: string | null
  order_items: {
    quantity: number
    price_at_purchase: number
    signs: { title: string; images: string[] | null } | null
  }[]
}

export function OrdersList({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [updating, setUpdating] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    setStatusError(null)
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    setUpdating(null)
    if (error) {
      setStatusError(error.message)
      return
    }
    router.refresh()
  }

  const exportSelected = () => {
    window.open(`/api/admin/orders/export-usps?ids=${Array.from(selected).join(',')}`, '_blank')
  }

  const printSelected = () => {
    window.open(`/admin/orders/packing-slips?ids=${Array.from(selected).join(',')}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {statusError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Couldn&apos;t update order status</p>
            <p className="text-red-700">{statusError}</p>
          </div>
        </div>
      )}

      {selected.size > 0 && (
        <div className="sticky top-16 z-10 bg-black text-white rounded-lg shadow px-4 py-3 flex items-center justify-between gap-2">
          <span className="text-sm">{selected.size} order{selected.size === 1 ? '' : 's'} selected</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10" onClick={printSelected}>
              <FileText className="w-4 h-4 mr-2" />
              Print Packing Slips
            </Button>
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10" onClick={exportSelected}>
              <Download className="w-4 h-4 mr-2" />
              Export Selected to CSV
            </Button>
          </div>
        </div>
      )}

      {orders.map((order) => {
        const stripeUrl = order.stripe_session_id
          ? `https://dashboard.stripe.com/${
              order.stripe_session_id.startsWith('cs_test_') ? 'test/' : ''
            }checkout/sessions/${order.stripe_session_id}`
          : null

        return (
          <div key={order.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(order.id)}
                  onChange={() => toggle(order.id)}
                  className="mt-1.5 w-4 h-4"
                  aria-label={`Select order ${order.id.slice(0, 8)}`}
                />
                <div>
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold text-lg hover:underline">
                    Order #{order.id.slice(0, 8)}
                  </Link>
                  <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
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
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatPrice(order.total)}</p>
                <select
                  value={order.status}
                  disabled={updating === order.id}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className={`mt-1 text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${
                    STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <Link href={`/admin/orders/${order.id}/packing-slip`} target="_blank">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Packing Slip
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <h4 className="font-semibold mb-2">Ship to</h4>
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

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Items</h4>
              <ul className="space-y-2">
                {order.order_items.map((item, index) => (
                  <li key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      {item.signs?.images?.[0] && (
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={item.signs.images[0]} alt={item.signs.title ?? ''} fill className="object-cover" />
                        </div>
                      )}
                      <span>
                        {item.signs?.title} × {item.quantity}
                      </span>
                    </div>
                    <span className="font-medium">{formatPrice(item.price_at_purchase * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}
    </div>
  )
}
