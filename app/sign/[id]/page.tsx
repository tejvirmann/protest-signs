'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Loader2 } from 'lucide-react'

interface Sign {
  id: string
  title: string
  description: string | null
  price: number
  quantity_available: number
  images: string[]
  sizes: string | null
}

export default function SignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sign, setSign] = useState<Sign | null>(null)
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

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    fetchSign()
    getUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setAddingToCart(true)

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('sign_id', sign!.id)
      .single()

    if (existingItem) {
      // Update quantity
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
    } else {
      // Insert new cart item
      await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          sign_id: sign!.id,
          quantity,
        })
    }

    setAddingToCart(false)
    router.push('/cart')
  }

  const handleBuyNow = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setBuyingNow(true)

    // Create checkout session
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            sign_id: sign!.id,
            quantity,
          },
        ],
      }),
    })

    const { url } = await response.json()
    if (url) {
      window.location.href = url
    } else {
      setBuyingNow(false)
      alert('Error creating checkout session')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!sign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign not found</h1>
          <Button onClick={() => router.push('/browse')}>
            Browse All Signs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
              {sign.images.length > 0 ? (
                <Image
                  src={sign.images[selectedImageIndex]}
                  alt={sign.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {sign.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {sign.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden relative ${
                      selectedImageIndex === index ? 'ring-2 ring-black' : ''
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${sign.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{sign.title}</h1>
            <p className="text-3xl font-bold mb-6">{formatPrice(sign.price)}</p>

            {sign.description && (
              <div className="mb-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-gray-600 whitespace-pre-line">{sign.description}</p>
              </div>
            )}

            {sign.sizes && (
              <div className="mb-6">
                <h2 className="font-semibold mb-2">Available Sizes</h2>
                <p className="text-gray-600">{sign.sizes}</p>
              </div>
            )}

            <div className="mb-6">
              <h2 className="font-semibold mb-2">Availability</h2>
              {sign.quantity_available > 0 ? (
                <p className="text-green-600">
                  {sign.quantity_available} in stock
                </p>
              ) : (
                <p className="text-red-600">Out of stock</p>
              )}
            </div>

            {sign.quantity_available > 0 && (
              <>
                <div className="mb-6">
                  <label htmlFor="quantity" className="block font-semibold mb-2">
                    Quantity
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={sign.quantity_available}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.min(parseInt(e.target.value) || 1, sign.quantity_available))
                    }
                    className="w-24 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleBuyNow}
                    disabled={buyingNow}
                    size="lg"
                    className="w-full"
                  >
                    {buyingNow ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Buy Now'
                    )}
                  </Button>

                  <Button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    {addingToCart ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 w-5 h-5" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
