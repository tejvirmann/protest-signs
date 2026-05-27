import type { Metadata } from 'next'
import { Megaphone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about the mission behind Protest Signs — a small business built on profit-sharing, community investment, and making political signs accessible to everyone.',
  alternates: { canonical: 'https://protestsigns.com/about' },
  openGraph: {
    title: 'About Us | Protest Signs',
    description: 'The story and mission behind Protest Signs — making living-wage job creation self-funding while getting quality signs into the hands of activists.',
    url: 'https://protestsigns.com/about',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Megaphone className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-gray-300">
            Everything is connected — and we are all in this together.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-gray-700 leading-relaxed text-lg">

          <div>
            <p>
              After nine years on the board of a non-profit promoting sustainability, and serving two terms as an elected official on a board of supervisors helping spend close to half a billion dollars of taxpayers' money, our founder came to realize that creating win-win relationships works better than picking winners and losers — or being continually underfunded while trying to promote the common good.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-black mb-3">Where It Started</h2>
            <p>
              Around the time of the Iraq War, our founder was making signs for a local peace group. It didn&apos;t take long to discover that protest signs were a great way to lose money. Twenty years ago you could print a nice sign for a couple of dollars — but you were more likely to give them away or take a donation than put a price on one, so you&apos;d be lucky to break even.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-black mb-3">The Problem — and the Solution</h2>
            <p>
              Fast forward to today: for a sign we&apos;d like to sell for $10, materials with printing could run $7–8 before overhead or labor — and when you add shipping on a heavy paper sign, the cost climbs to around $20. Protest signs are still a great way to lose money.
            </p>
            <p className="mt-4">
              The problem is we were making signs like it was the last century. By switching to plastic bags, we&apos;ve lowered both the shipping cost and the material cost. And it doesn&apos;t get any easier to make a sign than to attach a piece of cardboard to a stick and slide a bag over it.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-black mb-3">Our Long-Term Mission</h2>
            <p>
              Our long-term mission is to get the economy working for everyone — by making living-wage job creation self-funding, while simultaneously creating new revenue streams for our communities.
            </p>
            <p className="mt-4">
              Our business plan includes paying a living wage with good benefits, and <strong>fifty percent profit sharing</strong> for all employees and owners based on hours worked. Another <strong>ten percent of profits</strong> goes to public schools, a non-profit, or a government agency such as a Parks Department — creating a new, reliable revenue stream for the community.
            </p>
            <p className="mt-4">
              To make job creation self-funding: <strong>ten percent of profits are given to others as venture capital with no strings attached</strong> — to start their own business, on the condition they adopt a similar structure. Over time, this is intended to create a growing network of businesses where employees are the primary beneficiaries of their work, communities gain new revenue, and living-wage job creation becomes self-sustaining.
            </p>
          </div>

          <div className="border-t pt-8">
            <p className="text-gray-500 italic">
              It&apos;s complicated. Everything is connected, and we are all in this together — that&apos;s our message.
            </p>
            <p className="mt-2 text-gray-500 italic">Cheers</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 border-t">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to make your voice heard?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse?type=paper">
              <Button size="lg">Browse All Signs</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
