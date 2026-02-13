import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, Star, Shield, Truck, Megaphone } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 60

interface SignWithTags {
  id: string
  title: string
  price: number
  images: string[]
  quantity_available: number
  sign_tags: Array<{
    display_order: number
    tag_id: string
  }>
}

interface TagGroup {
  id: string
  name: string
  slug: string
  homepage_order: number
  signs: SignWithTags[]
}

export default async function HomePage() {
  const supabase = await createClient()

  // Get popular signs
  const { data: popularSigns } = await supabase
    .from('signs')
    .select('*')
    .eq('is_popular', true)
    .is('archived_at', null)
    .gt('quantity_available', 0)
    .order('display_order', { ascending: true })
    .limit(8)

  // Get seasonal signs
  const { data: seasonalSigns } = await supabase
    .from('signs')
    .select('*')
    .eq('is_seasonal', true)
    .is('archived_at', null)
    .gt('quantity_available', 0)
    .order('display_order', { ascending: true })
    .limit(8)

  // Get tags that should be shown on homepage
  const { data: homepageTags } = await supabase
    .from('tags')
    .select('*')
    .eq('show_on_homepage', true)
    .order('homepage_order', { ascending: true })

  // Get signs for each tag
  const tagGroups: TagGroup[] = []

  if (homepageTags) {
    for (const tag of homepageTags) {
      const { data: signTags } = await supabase
        .from('sign_tags')
        .select(`
          display_order,
          tag_id,
          signs (
            id,
            title,
            price,
            images,
            quantity_available,
            archived_at
          )
        `)
        .eq('tag_id', tag.id)
        .order('display_order', { ascending: true })
        .limit(8)

      const signs = signTags
        ?.map((st: any) => ({
          ...st.signs,
          sign_tags: [{ display_order: st.display_order, tag_id: st.tag_id }],
        }))
        .filter((sign: any) => sign.archived_at === null && sign.quantity_available > 0) || []

      if (signs.length > 0) {
        tagGroups.push({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          homepage_order: tag.homepage_order || 0,
          signs,
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Megaphone className="w-4 h-4" />
              <span className="text-sm font-medium">Professional Protest Signs</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              MAKE YOUR
              <span className="block bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                VOICE HEARD
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-300 max-w-3xl mx-auto">
              High-quality, professionally printed protest signs for every cause.
              Stand up, speak out, make an impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 border-white text-lg px-8 py-6">
                  Browse All Signs
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#categories">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                  View Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
                <p className="text-gray-600">
                  Professional printing on durable materials that last
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Fast Shipping</h3>
                <p className="text-gray-600">
                  Quick turnaround to get your message out there fast
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Weather Resistant</h3>
                <p className="text-gray-600">
                  Built to withstand outdoor conditions and last
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Signs Section */}
      {popularSigns && popularSigns.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold mb-2">🔥 Popular Signs</h2>
                <p className="text-xl text-gray-600">
                  Our best-selling designs making the biggest impact
                </p>
              </div>
              <Link
                href="/browse?featured=popular"
                className="flex items-center gap-2 text-black hover:gap-3 transition-all font-semibold group"
              >
                View All
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularSigns.slice(0, 4).map((sign) => (
                <Link
                  key={sign.id}
                  href={`/sign/${sign.id}`}
                  className="group cursor-pointer"
                >
                  <Card className="overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-300">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {sign.images.length > 0 ? (
                        <Image
                          src={sign.images[0]}
                          alt={sign.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Megaphone className="w-16 h-16" />
                        </div>
                      )}
                      {sign.quantity_available <= 5 && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          Only {sign.quantity_available} left
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-bold text-lg mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
                        {sign.title}
                      </h4>
                      <p className="text-2xl font-bold">{formatPrice(sign.price)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Seasonal Signs Section */}
      {seasonalSigns && seasonalSigns.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold mb-2">🌟 Seasonal Collection</h2>
                <p className="text-xl text-gray-600">
                  Timely messages for current movements and events
                </p>
              </div>
              <Link
                href="/browse?featured=seasonal"
                className="flex items-center gap-2 text-black hover:gap-3 transition-all font-semibold group"
              >
                View All
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {seasonalSigns.slice(0, 4).map((sign) => (
                <Link
                  key={sign.id}
                  href={`/sign/${sign.id}`}
                  className="group cursor-pointer"
                >
                  <Card className="overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-300">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {sign.images.length > 0 ? (
                        <Image
                          src={sign.images[0]}
                          alt={sign.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Megaphone className="w-16 h-16" />
                        </div>
                      )}
                      {sign.quantity_available <= 5 && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          Only {sign.quantity_available} left
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-bold text-lg mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
                        {sign.title}
                      </h4>
                      <p className="text-2xl font-bold">{formatPrice(sign.price)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section id="categories" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the perfect sign for your cause
            </p>
          </div>

          {tagGroups.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold mb-2">Coming Soon!</h3>
              <p className="text-gray-600 mb-8">
                We're adding signs to our collection. Check back soon!
              </p>
              <Link href="/contact">
                <Button size="lg">Contact Us</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-20">
              {tagGroups.map((group) => (
                <div key={group.id}>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-3xl font-bold mb-2">{group.name}</h3>
                      <p className="text-gray-600">
                        Powerful messages for {group.name.toLowerCase()}
                      </p>
                    </div>
                    <Link
                      href={`/browse?tag=${group.slug}`}
                      className="flex items-center gap-2 text-black hover:gap-3 transition-all font-semibold group"
                    >
                      View All
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {group.signs.slice(0, 4).map((sign) => (
                      <Link
                        key={sign.id}
                        href={`/sign/${sign.id}`}
                        className="group cursor-pointer"
                      >
                        <Card className="overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-300">
                          <div className="aspect-square bg-gray-100 relative overflow-hidden">
                            {sign.images.length > 0 ? (
                              <Image
                                src={sign.images[0]}
                                alt={sign.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Megaphone className="w-16 h-16" />
                              </div>
                            )}
                            {sign.quantity_available <= 5 && (
                              <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                Only {sign.quantity_available} left
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-bold text-lg mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
                              {sign.title}
                            </h4>
                            <p className="text-2xl font-bold">{formatPrice(sign.price)}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Megaphone className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Get in touch with us and we&apos;ll help you create the perfect sign for your cause.
            Custom designs available.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-6">
              Contact Support
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 mb-6">Trusted by activists and organizations nationwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
              <div className="text-2xl font-bold">ACLU</div>
              <div className="text-2xl font-bold">350.org</div>
              <div className="text-2xl font-bold">Local Organizers</div>
              <div className="text-2xl font-bold">Community Groups</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
