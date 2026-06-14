import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_owner')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  const isOwner = profile?.is_owner ?? false

  const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/signs', label: 'Signs' },
    { href: '/admin/pricing', label: 'Pricing' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/tags', label: 'Tags' },
    ...(isOwner ? [{ href: '/admin/users', label: 'Users' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-xl font-bold">Admin</h1>
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Back to site
            </Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-t-md transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="py-8 print:py-0">
        {children}
      </div>
    </div>
  )
}
