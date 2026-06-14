import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

export default function DonateSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <Heart className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
        <p className="text-gray-600 mb-8">
          Your contribution means a lot to us and helps keep this project going.
        </p>
        <Link href="/" className="block">
          <Button className="w-full">Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
