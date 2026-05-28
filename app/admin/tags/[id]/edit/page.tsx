'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/utils'

export default function EditTagPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [showOnHomepage, setShowOnHomepage] = useState(false)
  const [homepageOrder, setHomepageOrder] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: tag } = await supabase.from('tags').select('*').eq('id', id).single()
      if (!tag) { setNotFound(true); setLoading(false); return }
      setName(tag.name)
      setSlug(tag.slug)
      setShowOnHomepage(tag.show_on_homepage)
      setHomepageOrder(tag.homepage_order != null ? String(tag.homepage_order) : '')
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleNameChange = (value: string) => {
    setName(value)
    setSlug(slugify(value))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('tags').update({
      name,
      slug,
      show_on_homepage: showOnHomepage,
      homepage_order: showOnHomepage && homepageOrder ? parseInt(homepageOrder) : null,
    }).eq('id', id)
    if (error) { alert(`Save error: ${error.message}`); setSaving(false); return }
    router.push('/admin/tags')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this tag? It will be removed from all signs.')) return
    await supabase.from('sign_tags').delete().eq('tag_id', id)
    await supabase.from('tags').delete().eq('id', id)
    router.push('/admin/tags')
  }

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>
  if (notFound) return <div className="p-8 text-red-600">Tag not found.</div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin/tags">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tags
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Edit Tag</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input value={name} onChange={(e) => handleNameChange(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug *</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={showOnHomepage} onChange={(e) => setShowOnHomepage(e.target.checked)} className="rounded" id="show-on-homepage" />
              <label htmlFor="show-on-homepage" className="text-sm font-medium">Show on Homepage</label>
            </div>
            {showOnHomepage && (
              <div>
                <label className="block text-sm font-medium mb-2">Homepage Order</label>
                <Input type="number" value={homepageOrder} onChange={(e) => setHomepageOrder(e.target.value)} placeholder="1" />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>
            )}
            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
              <Link href="/admin/tags">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Danger Zone</h3>
            <Button type="button" variant="outline" onClick={handleDelete} className="text-red-600 border-red-300 hover:bg-red-50">
              Delete Tag
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Deletes the tag and removes it from all signs. Cannot be undone.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
