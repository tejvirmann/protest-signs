'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Megaphone } from 'lucide-react'

interface Tag {
  id: string
  name: string
  slug: string
}

interface Sign {
  id: string
  title: string
  price: number
  images: string[]
  quantity_available: number
  is_popular?: boolean
  is_seasonal?: boolean
}

function BrowsePageContent() {
  const searchParams = useSearchParams()
  const [signs, setSigns] = useState<Sign[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [featuredFilter, setFeaturedFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')

  const supabase = createClient()

  useEffect(() => {
    // Get pre-selected filters from URL
    const tagParam = searchParams.get('tag')
    const featuredParam = searchParams.get('featured')

    if (tagParam) {
      setSelectedTags([tagParam])
    }
    if (featuredParam) {
      setFeaturedFilter(featuredParam)
    }
  }, [searchParams])

  useEffect(() => {
    // Fetch all tags
    const fetchTags = async () => {
      const { data } = await supabase
        .from('tags')
        .select('id, name, slug')
        .order('name')
      if (data) setTags(data)
    }
    fetchTags()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Fetch signs based on filters
    const fetchSigns = async () => {
      setLoading(true)
      let query = supabase
        .from('signs')
        .select('*')
        .is('archived_at', null)
        .gt('quantity_available', 0)

      // Apply featured filter
      if (featuredFilter === 'popular') {
        query = query.eq('is_popular', true)
      } else if (featuredFilter === 'seasonal') {
        query = query.eq('is_seasonal', true)
      }

      // Apply sorting
      if (sortBy === 'price-asc') {
        query = query.order('price', { ascending: true })
      } else if (sortBy === 'price-desc') {
        query = query.order('price', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data: allSigns } = await query

      // Filter by tags (OR logic)
      if (selectedTags.length > 0 && allSigns) {
        const { data: signTags } = await supabase
          .from('sign_tags')
          .select('sign_id, tags(slug)')
          .in(
            'tag_id',
            tags
              .filter((t) => selectedTags.includes(t.slug))
              .map((t) => t.id)
          )

        const signIdsWithTags = new Set(signTags?.map((st) => st.sign_id) || [])
        const filteredSigns = allSigns.filter((sign) => signIdsWithTags.has(sign.id))
        setSigns(filteredSigns)
      } else {
        setSigns(allSigns || [])
      }

      setLoading(false)
    }

    if (tags.length > 0 || selectedTags.length === 0) {
      fetchSigns()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags, featuredFilter, sortBy, tags])

  const toggleTag = (slug: string) => {
    if (selectedTags.includes(slug)) {
      setSelectedTags(selectedTags.filter((t) => t !== slug))
    } else {
      setSelectedTags([...selectedTags, slug])
    }
  }

  const clearFilters = () => {
    setSelectedTags([])
    setFeaturedFilter('')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse All Signs</h1>
          <p className="text-lg text-gray-600">Find the perfect sign for your cause</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Filters</h2>
                {(selectedTags.length > 0 || featuredFilter) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Featured Collections */}
                <div>
                  <h3 className="font-semibold mb-3">Collections</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setFeaturedFilter(featuredFilter === 'popular' ? '' : 'popular')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        featuredFilter === 'popular'
                          ? 'bg-red-600 text-white font-semibold'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      🔥 Popular Signs
                    </button>
                    <button
                      onClick={() => setFeaturedFilter(featuredFilter === 'seasonal' ? '' : 'seasonal')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        featuredFilter === 'seasonal'
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      ⭐ Featured Collection
                    </button>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.slug)}
                          onChange={() => toggleTag(tag.slug)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{tag.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="font-semibold mb-3">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Signs Grid */}
          <div className="flex-1">
            {/* Active Filters */}
            {(selectedTags.length > 0 || featuredFilter) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {featuredFilter && (
                  <span className="inline-flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                    {featuredFilter === 'popular' ? '🔥 Popular' : '⭐ Featured'}
                    <button
                      onClick={() => setFeaturedFilter('')}
                      className="hover:bg-gray-800 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedTags.map((slug) => {
                  const tag = tags.find((t) => t.slug === slug)
                  return (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {tag?.name}
                      <button
                        onClick={() => toggleTag(slug)}
                        className="hover:bg-gray-700 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading signs...</p>
              </div>
            ) : signs.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-bold mb-2">No signs found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or check back later for new designs
                </p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    Showing <span className="font-semibold text-black">{signs.length}</span> {signs.length === 1 ? 'sign' : 'signs'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {signs.map((sign) => (
                    <Link
                      key={sign.id}
                      href={`/sign/${sign.id}`}
                      className="group cursor-pointer"
                    >
                      <Card className="overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                        <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                          {sign.images.length > 0 ? (
                            <Image
                              src={sign.images[0]}
                              alt={sign.title}
                              fill
                              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Megaphone className="w-16 h-16" />
                            </div>
                          )}
                          {sign.quantity_available <= 5 && (
                            <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                              {sign.quantity_available} left
                            </div>
                          )}
                        </div>
                        <CardContent className="p-5">
                          <h4 className="font-bold text-base mb-3 group-hover:text-gray-700 transition-colors line-clamp-2 min-h-[3rem]">
                            {sign.title}
                          </h4>
                          <p className="text-2xl font-bold text-black">{formatPrice(sign.price)}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold mb-8">Browse Signs</h1>
          <div className="text-center py-12">
            <p className="text-gray-600">Loading signs...</p>
          </div>
        </div>
      </div>
    }>
      <BrowsePageContent />
    </Suspense>
  )
}
