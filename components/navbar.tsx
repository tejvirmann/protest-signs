'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <div className="bg-black w-full h-full flex items-center justify-center text-white font-bold text-xs">
                  MS
                </div>
              </div>
              <span className="font-bold text-lg">MINIMAL SITE</span>
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
                href="/about"
                className={`${
                  pathname === '/about' ? 'text-black' : 'text-gray-600'
                } hover:text-black transition-colors`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`${
                  pathname === '/contact' ? 'text-black' : 'text-gray-600'
                } hover:text-black transition-colors`}
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <Link href="/about" className="text-gray-600 hover:text-black text-sm">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-black text-sm">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
