'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, Zap, Loader2, Check, Megaphone } from 'lucide-react'
import { addToGuestCart } from '@/lib/guest-cart'

interface Sign {
  id: string
  title: string
  price: number
  images: string[]
  quantity_available: number
  product_type: string | null
}

interface SignCardProps {
  sign: Sign
  index: number
  // Pass a pre-formatted price string, or null to show "bundle pricing" subtext
  priceLabel?: string | null
  // Sizes strings for Next.js Image
  singleSizes?: string
  dualSizes?: string
}

export function SignCard({
  sign,
  index,
  priceLabel,
  singleSizes = '(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(50vw - 4rem), calc(25vw - 2rem)',
  dualSizes = '(max-width: 640px) calc(50vw - 1rem), (max-width: 1024px) calc(25vw - 1rem), 12vw',
}: SignCardProps) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)

  const isBag = sign.product_type === 'bag'
  const showBothSides = isBag && sign.images.length >= 2

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (adding || added) return
    setAdding(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('sign_id', sign.id)
        .single()

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id)
      } else {
        await supabase.from('cart_items').insert({ user_id: user.id, sign_id: sign.id, quantity: 1 })
      }
    } else {
      addToGuestCart(sign.id, 1)
      window.dispatchEvent(new Event('guest-cart-update'))
    }

    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setBuyingNow(true)

    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ sign_id: sign.id, quantity: 1 }] }),
    })
    const { url, error } = await response.json()
    if (url) {
      window.location.href = url
    } else {
      alert(error || 'Checkout error. Please try again.')
      setBuyingNow(false)
    }
  }

  return (
    <div className="group h-full">
      <Card className="overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col relative">
        {sign.quantity_available <= 5 && (
          <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
            {sign.quantity_available} left
          </div>
        )}

        {/* Image — links to detail page */}
        <Link href={`/sign/${sign.id}`} className="block flex-shrink-0">
          {showBothSides ? (
            <div className="flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="relative flex-1 aspect-[3/4]">
                <Image
                  src={sign.images[0]}
                  alt={`${sign.title} — Side A`}
                  fill
                  priority={index < 4}
                  sizes={dualSizes}
                  className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative flex-1 aspect-[3/4] border-l border-gray-200">
                <Image
                  src={sign.images[1]}
                  alt={`${sign.title} — Side B`}
                  fill
                  priority={index < 4}
                  sizes={dualSizes}
                  className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          ) : (
            <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
              {sign.images.length > 0 ? (
                <Image
                  src={sign.images[0]}
                  alt={sign.title}
                  fill
                  priority={index < 4}
                  sizes={singleSizes}
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Megaphone className="w-16 h-16" />
                </div>
              )}
            </div>
          )}
        </Link>

        {/* Card body */}
        <CardContent className="p-4 flex flex-col flex-1">
          <Link href={`/sign/${sign.id}`} className="block mb-2">
            <h4 className="font-bold text-sm group-hover:text-gray-700 transition-colors line-clamp-2 min-h-[2.5rem]">
              {sign.title}
            </h4>
          </Link>

          {/* Price line */}
          {priceLabel !== undefined ? (
            priceLabel ? (
              <p className="text-sm font-bold text-black mb-3">{priceLabel}</p>
            ) : (
              <p className="text-xs text-gray-500 mb-3">Front &amp; back · bundle pricing</p>
            )
          ) : (
            <p className="text-xs text-gray-500 mb-3">
              {isBag ? 'Front & back · bundle pricing' : null}
            </p>
          )}

          {/* Buttons */}
          <div className="mt-auto flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-7 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-black"
              onClick={handleAddToCart}
              disabled={adding || buyingNow}
            >
              {added ? (
                <><Check className="w-3 h-3 mr-1" />Added</>
              ) : adding ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <><ShoppingCart className="w-3 h-3 mr-1" />Cart</>
              )}
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs h-7 bg-black hover:bg-gray-800 text-white border-0"
              onClick={handleBuyNow}
              disabled={buyingNow || adding}
            >
              {buyingNow ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <><Zap className="w-3 h-3 mr-1" />Buy Now</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
