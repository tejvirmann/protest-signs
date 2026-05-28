'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Edit, Archive, Trash2 } from 'lucide-react'

interface Props {
  id: string
  archivedAt: string | null
}

export function SignActions({ id, archivedAt }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const handleArchive = async () => {
    const action = archivedAt ? 'Unarchive' : 'Archive'
    if (!confirm(`${action} this sign?`)) return
    await supabase.from('signs').update({ archived_at: archivedAt ? null : new Date().toISOString() }).eq('id', id)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Permanently delete this sign? This cannot be undone.')) return
    await supabase.from('sign_tags').delete().eq('sign_id', id)
    await supabase.from('cart_items').delete().eq('sign_id', id)
    await supabase.from('signs').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/signs/${id}/edit`}>
        <Button variant="ghost" size="sm" title="Edit">
          <Edit className="w-4 h-4" />
        </Button>
      </Link>
      <Button variant="ghost" size="sm" onClick={handleArchive} title={archivedAt ? 'Unarchive' : 'Archive'} className="text-yellow-600 hover:text-yellow-700">
        <Archive className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDelete} title="Delete" className="text-red-600 hover:text-red-700">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
