'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, LogOut, User } from 'lucide-react'
import { getGuestCartCount } from '@/lib/guest-cart'

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Get user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        // Check if admin (with error handling to prevent page crash)
        supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching profile:', error.message)
              setIsAdmin(false) // Default to non-admin on error
            } else {
              setIsAdmin(data?.is_admin || false)
            }
          })

        // Get cart count (with error handling)
        supabase
          .from('cart_items')
          .select('quantity', { count: 'exact' })
          .eq('user_id', user.id)
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching cart:', error.message)
              setCartCount(0)
            } else {
              const total = data?.reduce((sum, item) => sum + item.quantity, 0) || 0
              setCartCount(total)
            }
          })
      } else {
        // Guest: read from localStorage
        setCartCount(getGuestCartCount())
      }
    })

    const refreshGuestCount = () => setCartCount(getGuestCartCount())
    window.addEventListener('guest-cart-update', refreshGuestCount)

    // Subscribe to cart changes
    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
        },
        () => {
          if (user) {
            supabase
              .from('cart_items')
              .select('quantity')
              .eq('user_id', user.id)
              .then(({ data }) => {
                const total = data?.reduce((sum, item) => sum + item.quantity, 0) || 0
                setCartCount(total)
              })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('guest-cart-update', refreshGuestCount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <div className="relative w-16 h-16">
                <Image
                  src="/logo.png"
                  alt="Protest Signs"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            <div className="hidden md:flex space-x-6">
              <Link
                href="/"
                className={`${
                  pathname === '/' ? 'text-black' : 'text-gray-600'
                } hover:text-black transition-colors`}
              >
                Home
              </Link>
              <Link
                href="/browse"
                className={`${
                  pathname === '/browse' ? 'text-black' : 'text-gray-600'
                } hover:text-black transition-colors`}
              >
                Browse
              </Link>
              <Link
                href="/about"
                className={`${
                  pathname === '/about' ? 'text-black' : 'text-gray-600'
                } hover:text-black transition-colors`}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className={`${
                  pathname === '/contact' ? 'text-black' : 'text-gray-600'
                } hover:text-black transition-colors`}
              >
                Contact
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`${
                    pathname.startsWith('/admin') ? 'text-black' : 'text-gray-600'
                  } hover:text-black transition-colors`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <>
                <Link href="/account">
                  <Button variant="ghost" size="sm" title="Account settings">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign out">
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="hidden sm:inline-flex">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
