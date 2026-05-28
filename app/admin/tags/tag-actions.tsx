'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'

interface Props {
  id: string
}

export function TagActions({ id }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Delete this tag? It will be removed from all signs.')) return
    await supabase.from('sign_tags').delete().eq('tag_id', id)
    await supabase.from('tags').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/tags/${id}/edit`}>
        <Button variant="ghost" size="sm" title="Edit">
          <Edit className="w-4 h-4" />
        </Button>
      </Link>
      <Button variant="ghost" size="sm" onClick={handleDelete} title="Delete" className="text-red-600 hover:text-red-700">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
