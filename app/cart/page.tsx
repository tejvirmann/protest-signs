'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Trash2, Loader2, ShoppingBag } from 'lucide-react'

interface CartItem {
  id: string
  quantity: number
  signs: {
    id: string
    title: string
    price: number
    images: string[]
    quantity_available: number
  }
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
      }
    }
    getUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user) {
      fetchCart()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchCart = async () => {
    const { data } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        signs (
          id,
          title,
          price,
          images,
          quantity_available
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setCartItems((data as any) || [])
    setLoading(false)
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId)
      return
    }

    await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId)

    fetchCart()
  }

  const removeItem = async (itemId: string) => {
    await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)

    fetchCart()
  }

  const handleCheckout = async () => {
    setCheckingOut(true)

    const items = cartItems.map((item) => ({
      sign_id: item.signs.id,
      quantity: item.quantity,
    }))

    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    })

    const { url, error } = await response.json()
    
    if (error) {
      alert(error)
      setCheckingOut(false)
    } else if (url) {
      window.location.href = url
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.signs.price * item.quantity,
    0
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Add some signs to get started
          </p>
          <Link href="/browse">
            <Button>Browse Signs</Button>
          </Link>
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
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-6 flex gap-6"
              >
                <Link
                  href={`/sign/${item.signs.id}`}
                  className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                >
                  {item.signs.images.length > 0 ? (
                    <Image
                      src={item.signs.images[0]}
                      alt={item.signs.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </Link>

                <div className="flex-1">
                  <Link
                    href={`/sign/${item.signs.id}`}
                    className="font-semibold text-lg hover:underline"
                  >
                    {item.signs.title}
                  </Link>
                  <p className="text-gray-600 mt-1">
                    {formatPrice(item.signs.price)}
                  </p>

                  {item.quantity > item.signs.quantity_available && (
                    <p className="text-red-600 text-sm mt-2">
                      Only {item.signs.quantity_available} available
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.id,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-16 text-center border-x border-gray-300 py-1"
                        min="1"
                        max={item.signs.quantity_available}
                      />
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.signs.quantity_available}
                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-lg">
                    {formatPrice(item.signs.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={checkingOut || cartItems.some(
                  (item) => item.quantity > item.signs.quantity_available
                )}
                size="lg"
                className="w-full"
              >
                {checkingOut ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>

              <Link href="/browse">
                <Button variant="ghost" className="w-full mt-3">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
