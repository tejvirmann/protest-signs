'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Trash2, Loader2, ShoppingBag } from 'lucide-react'
import { computeBagPrice, getPaperShipping, getPaperUnitPrice, type PricingTier } from '@/lib/pricing'

interface CartItem {
  id: string
  quantity: number
  signs: {
    id: string
    title: string
    price: number
    images: string[]
    quantity_available: number
    product_type: string | null
  }
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth/login')
      else setUser(user)
    }
    const fetchTiers = async () => {
      const res = await fetch('/api/pricing')
      const data = await res.json()
      setTiers(data.tiers ?? [])
    }
    getUser()
    fetchTiers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user) fetchCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchCart = async () => {
    const { data } = await supabase
      .from('cart_items')
      .select(`id, quantity, signs (id, title, price, images, quantity_available, product_type)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setCartItems((data as any) || [])
    setLoading(false)
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) { await removeItem(itemId); return }
    await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', itemId)
    fetchCart()
  }

  const removeItem = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId)
    fetchCart()
  }

  const handleCheckout = async () => {
    setCheckingOut(true)
    const items = cartItems.map((item) => ({ sign_id: item.signs.id, quantity: item.quantity }))
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    const { url, error } = await response.json()
    if (error) { alert(error); setCheckingOut(false) }
    else if (url) window.location.href = url
  }

  // ── Pricing calculations ─────────────────────────────────────────────────────
  const bagItems = cartItems.filter((i) => i.signs.product_type === 'bag')
  const paperItems = cartItems.filter((i) => i.signs.product_type !== 'bag')

  const totalBagQty = bagItems.reduce((sum, i) => sum + i.quantity, 0)
  const bagBundlePrice = tiers.length > 0 ? computeBagPrice(totalBagQty, tiers) : bagItems.reduce((s, i) => s + i.signs.price * i.quantity, 0)

  const paperUnitPrice = getPaperUnitPrice(tiers)
  const paperShipping = getPaperShipping(tiers)
  const totalPaperQty = paperItems.reduce((sum, i) => sum + i.quantity, 0)
  const paperSubtotal = totalPaperQty * paperUnitPrice
  const paperShippingCharge = paperItems.length > 0 ? paperShipping : 0

  const grandTotal = (totalBagQty > 0 ? bagBundlePrice : 0) + paperSubtotal + paperShippingCharge

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some signs to get started</p>
          <Link href="/browse"><Button>Browse Signs</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">

            {/* Bag signs */}
            {bagItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-700">Bag Signs</h2>
                  <span className="text-sm text-gray-500">
                    {totalBagQty} bag{totalBagQty !== 1 ? 's' : ''} — bundle price: <strong>{formatPrice(bagBundlePrice)}</strong> (shipping included)
                  </span>
                </div>
                {bagItems.map((item) => (
                  <CartItemRow key={item.id} item={item} onUpdate={updateQuantity} onRemove={removeItem} priceDisplay={null} />
                ))}
              </div>
            )}

            {/* Paper signs */}
            {paperItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-700">Paper Signs</h2>
                  <span className="text-sm text-gray-500">
                    {totalPaperQty} sign{totalPaperQty !== 1 ? 's' : ''} × {formatPrice(paperUnitPrice)} + {formatPrice(paperShipping)} shipping
                  </span>
                </div>
                {paperItems.map((item) => (
                  <CartItemRow key={item.id} item={item} onUpdate={updateQuantity} onRemove={removeItem} priceDisplay={formatPrice(paperUnitPrice * item.quantity)} />
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4 text-sm">
                {totalBagQty > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bag signs ({totalBagQty} — bundle)</span>
                    <span>{formatPrice(bagBundlePrice)}</span>
                  </div>
                )}
                {paperItems.length > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paper signs ({totalPaperQty})</span>
                      <span>{formatPrice(paperSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paper sign shipping</span>
                      <span>{formatPrice(paperShippingCharge)}</span>
                    </div>
                  </>
                )}
                {totalBagQty > 0 && (
                  <div className="flex justify-between text-green-600 text-xs">
                    <span>Bag sign shipping</span>
                    <span>Included</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Tax calculated at checkout</p>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={checkingOut || cartItems.some((item) => item.quantity > item.signs.quantity_available)}
                size="lg"
                className="w-full"
              >
                {checkingOut ? <><Loader2 className="mr-2 w-5 h-5 animate-spin" />Processing...</> : 'Proceed to Checkout'}
              </Button>

              <Link href="/browse">
                <Button variant="ghost" className="w-full mt-3">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CartItemRow({
  item,
  onUpdate,
  onRemove,
  priceDisplay,
}: {
  item: CartItem
  onUpdate: (id: string, qty: number) => void
  onRemove: (id: string) => void
  priceDisplay: string | null
}) {
  return (
    <div className="bg-white rounded-lg p-6 flex gap-6 mb-3">
      <Link href={`/sign/${item.signs.id}`} className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.signs.images.length > 0 ? (
          <Image src={item.signs.images[0]} alt={item.signs.title} fill className="object-contain p-2" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
        )}
      </Link>

      <div className="flex-1">
        <Link href={`/sign/${item.signs.id}`} className="font-semibold hover:underline">{item.signs.title}</Link>

        {item.quantity > item.signs.quantity_available && (
          <p className="text-red-600 text-sm mt-1">Only {item.signs.quantity_available} available</p>
        )}

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button onClick={() => onUpdate(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100">-</button>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => onUpdate(item.id, Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-center border-x border-gray-300 py-1 text-sm"
              min="1"
              max={item.signs.quantity_available}
            />
            <button
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.signs.quantity_available}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            >+</button>
          </div>
          <button onClick={() => onRemove(item.id)} className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm">
            <Trash2 className="w-4 h-4" />Remove
          </button>
        </div>
      </div>

      {priceDisplay && (
        <div className="text-right font-semibold">{priceDisplay}</div>
      )}
    </div>
  )
}
