import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'About - Minimal Next.js Site',
  description: 'Learn more about this minimal Next.js site.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-8">About Us</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-6">
              This is a minimal Next.js website designed to demonstrate a clean, working deployment on Vercel.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-4">Our Tech Stack</h2>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Next.js 14</strong> - React framework with App Router</li>
              <li><strong>TypeScript</strong> - Type-safe development</li>
              <li><strong>Tailwind CSS</strong> - Utility-first styling</li>
              <li><strong>Vercel</strong> - Deployment platform</li>
            </ul>

            <h2 className="text-3xl font-bold mt-12 mb-4">Why This Exists</h2>
            <p className="text-gray-700 mb-4">
              This minimal site serves as a baseline to ensure clean deployments before adding
              more complex features and integrations. By starting simple, we can identify and
              resolve deployment issues early.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-4">What&apos;s Next</h2>
            <p className="text-gray-700 mb-4">
              Once this baseline is working perfectly, we can gradually add:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>Database integration</li>
              <li>Authentication system</li>
              <li>API routes</li>
              <li>Additional features as needed</li>
            </ul>
          </div>

          <div className="mt-12">
            <Link href="/contact">
              <Button size="lg">Get In Touch</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
