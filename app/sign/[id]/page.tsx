'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Loader2, Truck, AlertCircle, Package } from 'lucide-react'
import { computeBagPrice, getBagTiers, getPaperShipping, type PricingTier } from '@/lib/pricing'

interface Sign {
  id: string
  title: string
  description: string | null
  price: number
  quantity_available: number
  images: string[]
  sizes: string | null
  product_type: string | null
}

export default function SignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sign, setSign] = useState<Sign | null>(null)
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    const fetchSign = async () => {
      const { data } = await supabase
        .from('signs')
        .select('*')
        .eq('id', params.id)
        .is('archived_at', null)
        .single()
      setSign(data)
      setLoading(false)
    }

    const fetchTiers = async () => {
      const res = await fetch('/api/pricing')
      const data = await res.json()
      setTiers(data.tiers ?? [])
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    fetchSign()
    fetchTiers()
    getUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const isBag = sign?.product_type === 'bag'
  const bagTierList = getBagTiers(tiers)
  const paperShipping = getPaperShipping(tiers)
  const previewBagPrice = computeBagPrice(quantity, tiers)

  const handleAddToCart = async () => {
    if (!user) { router.push('/auth/login'); return }
    setAddingToCart(true)

    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('sign_id', sign!.id)
      .single()

    if (existingItem) {
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
    } else {
      await supabase.from('cart_items').insert({ user_id: user.id, sign_id: sign!.id, quantity })
    }

    setAddingToCart(false)
    router.push('/cart')
  }

  const handleBuyNow = async () => {
    if (!user) { router.push('/auth/login'); return }
    setBuyingNow(true)

    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ sign_id: sign!.id, quantity }] }),
    })

    const { url } = await response.json()
    if (url) window.location.href = url
    else { setBuyingNow(false); alert('Error creating checkout session') }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

  if (!sign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign not found</h1>
          <Button onClick={() => router.push('/browse')}>Browse All Signs</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-12">

          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
              {sign.images.length > 0 ? (
                <Image src={sign.images[selectedImageIndex]} alt={sign.title} fill className="object-contain p-4" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image available</div>
              )}
            </div>
            {sign.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {sign.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden relative ${selectedImageIndex === index ? 'ring-2 ring-black' : ''}`}
                  >
                    <Image src={image} alt={`Side ${index + 1}`} fill className="object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
            {isBag && sign.images.length > 1 && (
              <p className="text-xs text-gray-400 mt-2 text-center">Click thumbnails to see both sides</p>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{sign.title}</h1>

            {/* Price */}
            {isBag ? (
              <div className="mb-6">
                <p className="text-3xl font-bold mb-1">
                  {tiers.length > 0 ? formatPrice(previewBagPrice) : formatPrice(sign.price)}
                </p>
                <p className="text-sm text-gray-500">
                  {quantity === 1
                    ? 'Single bag — add more bag signs to your cart for bundle savings'
                    : `${quantity}-bag bundle price`}
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-3xl font-bold mb-1">
                  {formatPrice(sign.price)}{' '}
                  <span className="text-lg font-normal text-gray-500">per sign</span>
                </p>
                <p className="text-sm text-gray-500">
                  + {formatPrice(paperShipping)} flat shipping on any paper sign order
                </p>
              </div>
            )}

            {/* Description */}
            {sign.description && (
              <div className="mb-6">
                <p className="text-gray-600 text-sm leading-relaxed">{sign.description}</p>
              </div>
            )}

            {/* Bag bundle pricing table */}
            {isBag && bagTierList.length > 0 && (
              <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Bundle Pricing — Shipping Included
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {bagTierList.map((tier) => (
                      <tr key={tier.id}>
                        <td className="px-4 py-2 text-gray-700">{tier.label}</td>
                        <td className="px-4 py-2 text-right font-semibold">
                          {formatPrice(tier.price)}
                          {tier.max_qty === null && tier.overflow_unit_price != null && (
                            <span className="text-gray-400 font-normal"> + {formatPrice(tier.overflow_unit_price)}/bag</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700">
                  Bundle price applies across <strong>all bag signs</strong> in your cart.
                </div>
              </div>
            )}

            {/* Paper info box */}
            {!isBag && (
              <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Shipping & Sizing
                </div>
                <div className="px-4 py-3 space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Per sign</span>
                    <span className="font-semibold">{formatPrice(sign.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flat shipping (any quantity)</span>
                    <span className="font-semibold">{formatPrice(paperShipping)}</span>
                  </div>
                  <div className="border-t pt-2 text-gray-500 text-xs space-y-1">
                    <p>Size: 13.25&quot; × 26&quot; — 130# cardstock (heavy paper)</p>
                    <p>Need <strong>2 copies</strong> for a double-sided sign</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="mb-4">
              {sign.quantity_available > 0 ? (
                sign.quantity_available <= 5 ? (
                  <p className="text-amber-600 text-sm font-medium">Only {sign.quantity_available} left in stock</p>
                ) : (
                  <p className="text-green-600 text-sm">In stock</p>
                )
              ) : (
                <p className="text-red-600 text-sm font-medium">Out of stock</p>
              )}
            </div>

            {/* Quantity + CTA */}
            {sign.quantity_available > 0 && (
              <>
                <div className="mb-6">
                  <label htmlFor="quantity" className="block text-sm font-semibold mb-2">Quantity</label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={sign.quantity_available}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, sign.quantity_available))}
                    className="w-24 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="space-y-3 mb-6">
                  <Button onClick={handleBuyNow} disabled={buyingNow} size="lg" className="w-full">
                    {buyingNow ? <><Loader2 className="mr-2 w-5 h-5 animate-spin" />Processing...</> : 'Buy Now'}
                  </Button>
                  <Button onClick={handleAddToCart} disabled={addingToCart} variant="outline" size="lg" className="w-full">
                    {addingToCart
                      ? <><Loader2 className="mr-2 w-5 h-5 animate-spin" />Adding...</>
                      : <><ShoppingCart className="mr-2 w-5 h-5" />Add to Cart</>}
                  </Button>
                </div>
              </>
            )}

            {/* Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Cardboard and stick not included</p>
                  <p>You cut cardboard to size and attach it to a stick.</p>
                  {isBag && (
                    <p className="mt-1">Tip: cover cardboard with white paper if it has printing — bags are slightly transparent.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <Truck className="w-4 h-4" />
              {isBag ? 'Shipping included in all bag sign prices' : `Flat ${formatPrice(paperShipping)} shipping on any paper sign order`}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <Package className="w-4 h-4" />
              Defective signs replaced. No returns after use at a march.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
