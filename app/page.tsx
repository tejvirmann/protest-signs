import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Welcome
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600">
            This is a minimal Next.js site deployed on Vercel.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/about">
              <Button size="lg" variant="outline">
                About Us
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg">
                Contact
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Fast</h3>
              <p className="text-gray-600">
                Built with Next.js 14 for optimal performance
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-semibold mb-2">Modern</h3>
              <p className="text-gray-600">
                Styled with Tailwind CSS for a clean look
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">☁️</div>
              <h3 className="text-xl font-semibold mb-2">Deployed</h3>
              <p className="text-gray-600">
                Hosted on Vercel for reliable uptime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to learn more?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Check out our about page or get in touch with us.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/about">
              <Button size="lg" variant="outline">Learn More</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg">Get In Touch</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
