import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const adminClient = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: currentProfile } = await adminClient
    .from('profiles')
    .select('is_admin, is_owner')
    .eq('id', user.id)
    .single()

  if (!currentProfile?.is_owner) {
    return NextResponse.json({ error: 'Only owners can manage roles' }, { status: 403 })
  }

  const body = await request.json()
  const { action } = body

  const targetId = params.id

  // Prevent owner from removing their own owner status via this endpoint
  if (targetId === user.id && action === 'remove_owner') {
    return NextResponse.json({ error: 'Cannot remove your own owner status' }, { status: 400 })
  }

  if (action === 'make_admin') {
    await adminClient.from('profiles').update({ is_admin: true }).eq('id', targetId)
  } else if (action === 'remove_admin') {
    // Cannot remove admin from an owner
    const { data: target } = await adminClient.from('profiles').select('is_owner').eq('id', targetId).single()
    if (target?.is_owner) {
      return NextResponse.json({ error: 'Cannot remove admin from an owner' }, { status: 400 })
    }
    await adminClient.from('profiles').update({ is_admin: false }).eq('id', targetId)
  } else if (action === 'transfer_owner') {
    // Transfer: new user becomes owner+admin, current user stays admin but loses owner
    await adminClient.from('profiles').update({ is_owner: true, is_admin: true }).eq('id', targetId)
    await adminClient.from('profiles').update({ is_owner: false }).eq('id', user.id)
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
