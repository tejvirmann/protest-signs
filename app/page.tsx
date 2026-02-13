import Link from 'next/link'
// import Image from 'next/image'
// import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
// import { formatPrice } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

// Temporarily disabled to isolate deployment issues
// export const dynamic = 'force-dynamic'
// export const revalidate = 60

// interface SignWithTags {
//   id: string
//   title: string
//   price: number
//   images: string[]
//   quantity_available: number
//   sign_tags: Array<{
//     display_order: number
//     tag_id: string
//   }>
// }

// interface TagGroup {
//   id: string
//   name: string
//   slug: string
//   homepage_order: number
//   signs: SignWithTags[]
// }

export default async function HomePage() {
  // ALL DATABASE LOGIC TEMPORARILY DISABLED FOR DEBUGGING
  // let tagGroups: TagGroup[] = []

  // try {
  //   console.log('[HomePage] Starting - checking env vars')
  //   console.log('[HomePage] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING')
  //   console.log('[HomePage] NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING')

  //   const supabase = await createClient()
  //   console.log('[HomePage] Supabase client created')

  //   // Get tags that should be shown on homepage
  //   const { data: homepageTags, error: tagsError } = await supabase
  //     .from('tags')
  //     .select('*')
  //     .eq('show_on_homepage', true)
  //     .order('homepage_order', { ascending: true })

  //   if (tagsError) {
  //     console.error('[HomePage] Error fetching tags:', tagsError)
  //     throw tagsError
  //   }

  //   console.log('[HomePage] Fetched tags:', homepageTags?.length || 0)

  //   if (homepageTags) {
  //     for (const tag of homepageTags) {
  //       const { data: signTags, error: signTagsError } = await supabase
  //         .from('sign_tags')
  //         .select(`
  //           display_order,
  //           tag_id,
  //           signs (
  //             id,
  //             title,
  //             price,
  //             images,
  //             quantity_available,
  //             archived_at
  //           )
  //         `)
  //         .eq('tag_id', tag.id)
  //         .order('display_order', { ascending: true })
  //         .limit(6)

  //       if (signTagsError) {
  //         console.error('[HomePage] Error fetching sign_tags for tag', tag.id, ':', signTagsError)
  //         continue
  //       }

  //       const signs = signTags
  //         ?.map((st: any) => ({
  //           ...st.signs,
  //           sign_tags: [{ display_order: st.display_order, tag_id: st.tag_id }],
  //         }))
  //         .filter((sign: any) => sign.archived_at === null && sign.quantity_available > 0) || []

  //       if (signs.length > 0) {
  //         tagGroups.push({
  //           id: tag.id,
  //           name: tag.name,
  //           slug: tag.slug,
  //           homepage_order: tag.homepage_order || 0,
  //           signs,
  //         })
  //       }
  //     }
  //   }

  //   console.log('[HomePage] Tag groups built:', tagGroups.length)
  // } catch (error) {
  //   console.error('[HomePage] Fatal error:', error)
  //   console.error('[HomePage] Error details:', JSON.stringify(error, null, 2))
  //   // Don't throw - just show empty state
  // }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            MAKE YOUR VOICE HEARD
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            High-quality protest signs for every cause
          </p>
          <Link href="/browse">
            <Button size="lg" variant="outline" className="bg-white text-black hover:bg-gray-100 border-white">
              Browse All Signs
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Temporary message while debugging */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Site Under Maintenance</h2>
          <p className="text-gray-600 mb-8">
            We&apos;re working on getting everything set up. Check back soon!
          </p>
          <p className="text-sm text-gray-500">
            Debug: If you can see this, the deployment is working. Database connection temporarily disabled.
          </p>
        </div>
      </section>

      {/* ALL DYNAMIC CONTENT TEMPORARILY COMMENTED OUT */}
      {/* {tagGroups.length === 0 ? (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">No Signs Available Yet</h2>
            <p className="text-gray-600 mb-8">
              Check back soon for our collection of protest signs.
            </p>
            <Link href="/contact">
              <Button>Contact Us</Button>
            </Link>
          </div>
        </section>
      ) : (
        tagGroups.map((group) => (
          <section key={group.id} className="py-16 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">{group.name}</h2>
                <Link
                  href={`/browse?tag=${group.slug}`}
                  className="flex items-center text-gray-600 hover:text-black transition-colors"
                >
                  Look at more
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {group.signs.slice(0, 4).map((sign) => (
                  <Link
                    key={sign.id}
                    href={`/sign/${sign.id}`}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                      {sign.images.length > 0 ? (
                        <Image
                          src={sign.images[0]}
                          alt={sign.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                      {sign.quantity_available <= 5 && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                          Only {sign.quantity_available} left
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:underline">
                      {sign.title}
                    </h3>
                    <p className="text-gray-600">{formatPrice(sign.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))
      )} */}

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get in touch with us and we&apos;ll help you create the perfect sign for your cause.
          </p>
          <Link href="/contact">
            <Button size="lg">Contact Support</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
