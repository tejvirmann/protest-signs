'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Upload, X, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Tag { id: string; name: string; slug: string }

export default function EditSignPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [sizes, setSizes] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<{ [key: string]: number }>({})
  const [productType, setProductType] = useState<'paper' | 'bag'>('paper')
  const [isPopular, setIsPopular] = useState(false)
  const [isSeasonal, setIsSeasonal] = useState(false)
  const [displayOrder, setDisplayOrder] = useState('0')
  const [archivedAt, setArchivedAt] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const [{ data: sign }, { data: allTags }, { data: signTags }] = await Promise.all([
        supabase.from('signs').select('*').eq('id', id).single(),
        supabase.from('tags').select('*').order('name'),
        supabase.from('sign_tags').select('*').eq('sign_id', id),
      ])

      if (!sign) { setNotFound(true); setLoading(false); return }

      setTitle(sign.title)
      setDescription(sign.description ?? '')
      setPrice((sign.price / 100).toFixed(2))
      setQuantity(String(sign.quantity_available))
      setSizes(sign.sizes ?? '')
      setImages(sign.images ?? [])
      setArchivedAt(sign.archived_at)
      // eslint-disable-next-line
      const s = sign as any // fields added by migrations not yet in generated types
      setProductType(s.product_type ?? 'paper')
      setIsPopular(s.is_popular ?? false)
      setIsSeasonal(s.is_seasonal ?? false)
      setDisplayOrder(String(s.display_order ?? 0))

      if (allTags) setTags(allTags)
      if (signTags) {
        const tagMap: { [key: string]: number } = {}
        signTags.forEach((st) => { tagMap[st.tag_id] = st.display_order })
        setSelectedTags(tagMap)
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleAddImage = () => {
    if (imageUrl.trim()) { setImages([...images, imageUrl.trim()]); setImageUrl('') }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const path = `signs/${Math.random().toString(36).slice(2)}-${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('signs').upload(path, file)
        if (error) { alert(`Upload error: ${error.message}`); continue }
        const { data: { publicUrl } } = supabase.storage.from('signs').getPublicUrl(path)
        setImages((prev) => [...prev, publicUrl])
      }
    } catch (e: unknown) {
      alert(`Upload failed: ${e instanceof Error ? e.message : e}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from('signs').update({
      title,
      description: description || null,
      price: Math.round(parseFloat(price) * 100),
      quantity_available: parseInt(quantity),
      images,
      sizes: sizes || null,
      product_type: productType,
      is_popular: isPopular,
      is_seasonal: isSeasonal,
      display_order: parseInt(displayOrder) || 0,
      updated_at: new Date().toISOString(),
    // eslint-disable-next-line
    } as any).eq('id', id)

    if (error) { alert(`Save error: ${error.message}`); setSaving(false); return }

    await supabase.from('sign_tags').delete().eq('sign_id', id)
    const signTagRows = Object.entries(selectedTags).map(([tagId, order]) => ({
      sign_id: id, tag_id: tagId, display_order: order,
    }))
    if (signTagRows.length > 0) await supabase.from('sign_tags').insert(signTagRows)

    router.push('/admin/signs')
  }

  const handleArchive = async () => {
    const action = archivedAt ? 'Unarchive' : 'Archive'
    if (!confirm(`${action} this sign?`)) return
    const newVal = archivedAt ? null : new Date().toISOString()
    await supabase.from('signs').update({ archived_at: newVal }).eq('id', id)
    setArchivedAt(newVal)
  }

  const handleDelete = async () => {
    if (!confirm('Permanently delete this sign? This cannot be undone.')) return
    await supabase.from('sign_tags').delete().eq('sign_id', id)
    await supabase.from('cart_items').delete().eq('sign_id', id)
    await supabase.from('signs').delete().eq('id', id)
    router.push('/admin/signs')
  }

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>
  if (notFound) return <div className="p-8 text-red-600">Sign not found.</div>

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
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl">Edit Sign</CardTitle>
            {archivedAt && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Archived</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price ($) *</label>
                <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Quantity *</label>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sizes</label>
              <Input value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="12x18, 18x24, 24x36" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sign Type *</label>
              <div className="flex gap-4 border rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer flex-1">
                  <input type="radio" name="product_type" value="paper" checked={productType === 'paper'} onChange={() => setProductType('paper')} className="mt-1" />
                  <div>
                    <span className="font-medium">Paper Sign</span>
                    <p className="text-xs text-gray-500">Printed on cardstock.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer flex-1">
                  <input type="radio" name="product_type" value="bag" checked={productType === 'bag'} onChange={() => setProductType('bag')} className="mt-1" />
                  <div>
                    <span className="font-medium">Plastic Bag Sign</span>
                    <p className="text-xs text-gray-500">Bundle pricing. Add 2 images for front &amp; back.</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Images</label>
              <div className="mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" id="file-upload" disabled={uploading} />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">{uploading ? 'Uploading...' : 'Click to upload images'}</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB each</p>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> Or add by URL:
                </p>
                <div className="flex gap-2">
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                  <Button type="button" onClick={handleAddImage} variant="outline">Add</Button>
                </div>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((url, i) => (
                    <div key={i} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                        <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
                      </div>
                      <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {productType === 'bag' && i === 0 ? 'Side A (front)' : productType === 'bag' && i === 1 ? 'Side B (back)' : `Image ${i + 1}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categories (Tags)</label>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-4">
                    <input type="checkbox" checked={!!selectedTags[tag.id]}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTags({ ...selectedTags, [tag.id]: 0 })
                        else { const t = { ...selectedTags }; delete t[tag.id]; setSelectedTags(t) }
                      }} className="rounded" />
                    <span className="flex-1">{tag.name}</span>
                    {selectedTags[tag.id] !== undefined && (
                      <Input type="number" value={selectedTags[tag.id]}
                        onChange={(e) => setSelectedTags({ ...selectedTags, [tag.id]: parseInt(e.target.value) || 0 })}
                        placeholder="Order" className="w-24" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Featured Sections</label>
              <div className="space-y-3 border rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="rounded w-4 h-4 mt-0.5" />
                  <div>
                    <span className="font-medium">🔥 Popular Sign</span>
                    <p className="text-xs text-gray-500">Show in &quot;Popular Signs&quot; section on homepage</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={isSeasonal} onChange={(e) => setIsSeasonal(e.target.checked)} className="rounded w-4 h-4 mt-0.5" />
                  <div>
                    <span className="font-medium">🌟 Seasonal Sign</span>
                    <p className="text-xs text-gray-500">Show in &quot;Seasonal Collection&quot; section</p>
                  </div>
                </label>
                {(isPopular || isSeasonal) && (
                  <div className="pt-2">
                    <label className="block text-sm font-medium mb-2">Display Order</label>
                    <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className="w-32" />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving || uploading} size="lg">
                {saving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
              <Link href="/admin/signs">
                <Button type="button" variant="outline" size="lg">Cancel</Button>
              </Link>
            </div>
          </form>

          {/* Danger zone */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Danger Zone</h3>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleArchive}>
                {archivedAt ? 'Unarchive Sign' : 'Archive Sign'}
              </Button>
              <Button type="button" variant="outline" onClick={handleDelete} className="text-red-600 border-red-300 hover:bg-red-50">
                Permanently Delete
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Archive hides the sign from customers. Permanently deleting removes it and cannot be undone.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
