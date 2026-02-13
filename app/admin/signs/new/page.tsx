'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Upload, X, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Tag {
  id: string
  name: string
  slug: string
}

export default function NewSignPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [sizes, setSizes] = useState('12x18, 18x24, 24x36')
  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<{ [key: string]: number }>({})
  const [isPopular, setIsPopular] = useState(false)
  const [isSeasonal, setIsSeasonal] = useState(false)
  const [displayOrder, setDisplayOrder] = useState('0')

  const supabase = createClient()

  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await supabase.from('tags').select('*').order('name')
      if (data) setTags(data)
    }
    fetchTags()
  }, [])

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()])
      setImageUrl('')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = `signs/${fileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('signs')
          .upload(filePath, file)

        if (error) {
          alert(`Upload error: ${error.message}`)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('signs')
          .getPublicUrl(filePath)

        setImages((prev) => [...prev, publicUrl])
      }
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const priceInCents = Math.round(parseFloat(price) * 100)

    // Insert sign
    const { data: sign, error } = await supabase
      .from('signs')
      .insert({
        title,
        description: description || null,
        price: priceInCents,
        quantity_available: parseInt(quantity),
        images,
        sizes: sizes || null,
        is_popular: isPopular,
        is_seasonal: isSeasonal,
        display_order: parseInt(displayOrder) || 0,
      })
      .select()
      .single()

    if (error) {
      alert(`Error: ${error.message}`)
      setLoading(false)
      return
    }

    // Insert sign_tags
    const signTags = Object.entries(selectedTags).map(([tagId, displayOrder]) => ({
      sign_id: sign.id,
      tag_id: tagId,
      display_order: displayOrder,
    }))

    if (signTags.length > 0) {
      await supabase.from('sign_tags').insert(signTags)
    }

    router.push('/admin/signs')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin/signs">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Signs
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Sign</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., CLIMATE JUSTICE NOW"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the sign, materials, size, and use case..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price ($) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="24.99"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter as decimal (e.g., 24.99)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quantity *</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  placeholder="50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Stock available
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sizes (Optional)</label>
              <Input
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                placeholder="12x18, 18x24, 24x36"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Images *</label>

              {/* File Upload */}
              <div className="mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                      {uploading ? 'Uploading...' : 'Click to upload images'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 5MB each
                    </p>
                  </label>
                </div>
              </div>

              {/* OR URL Input */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Or add image by URL:
                </p>
                <div className="flex gap-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button type="button" onClick={handleAddImage} variant="outline">
                    Add
                  </Button>
                </div>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    {images.length} {images.length === 1 ? 'image' : 'images'} added:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          Image {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {images.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  ⚠️ At least one image is recommended
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categories (Tags)</label>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={!!selectedTags[tag.id]}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags({ ...selectedTags, [tag.id]: 0 })
                        } else {
                          const newTags = { ...selectedTags }
                          delete newTags[tag.id]
                          setSelectedTags(newTags)
                        }
                      }}
                      className="rounded"
                    />
                    <span className="flex-1">{tag.name}</span>
                    {selectedTags[tag.id] !== undefined && (
                      <Input
                        type="number"
                        value={selectedTags[tag.id]}
                        onChange={(e) =>
                          setSelectedTags({
                            ...selectedTags,
                            [tag.id]: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="Order"
                        className="w-24"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Featured Sections</label>
              <div className="space-y-3 border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded w-4 h-4"
                    id="is-popular"
                  />
                  <label htmlFor="is-popular" className="flex-1 cursor-pointer">
                    <span className="font-medium">🔥 Popular Sign</span>
                    <p className="text-xs text-gray-500">Show in "Popular Signs" section on homepage</p>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSeasonal}
                    onChange={(e) => setIsSeasonal(e.target.checked)}
                    className="rounded w-4 h-4"
                    id="is-seasonal"
                  />
                  <label htmlFor="is-seasonal" className="flex-1 cursor-pointer">
                    <span className="font-medium">🌟 Seasonal Sign</span>
                    <p className="text-xs text-gray-500">Show in "Seasonal Collection" section</p>
                  </label>
                </div>

                {(isPopular || isSeasonal) && (
                  <div className="pt-2">
                    <label className="block text-sm font-medium mb-2">Display Order</label>
                    <Input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(e.target.value)}
                      placeholder="0"
                      className="w-32"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower numbers appear first (0 = highest priority)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || uploading} size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Sign'
                )}
              </Button>
              <Link href="/admin/signs">
                <Button type="button" variant="outline" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
