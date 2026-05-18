import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Tags, ShoppingBag, MessageSquare, Users, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_owner')
    .eq('id', user!.id)
    .single()

  const isOwner = profile?.is_owner ?? false

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Welcome, {isOwner ? 'Owner' : 'Admin'}
        </h2>
        <p className="text-gray-600">Manage your protest signs store</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/admin/signs">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Signs</CardTitle>
              <Package className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-gray-500">Create, edit, delete signs</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/tags">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tags</CardTitle>
              <Tags className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-gray-500">Create, edit categories</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingBag className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View</div>
              <p className="text-xs text-gray-500">Track customer orders</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/pricing">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pricing</CardTitle>
              <DollarSign className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Edit</div>
              <p className="text-xs text-gray-500">Bundle & shipping rates</p>
            </CardContent>
          </Card>
        </Link>

        {isOwner ? (
          <Link href="/admin/users">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
                <Users className="w-4 h-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage</div>
                <p className="text-xs text-gray-500">Roles & permissions</p>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View</div>
              <p className="text-xs text-gray-500">Contact submissions</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href="/admin/signs">
              <Button>View All Signs</Button>
            </Link>
            <Link href="/admin/signs/new">
              <Button variant="outline">Create New Sign</Button>
            </Link>
            <Link href="/admin/tags">
              <Button variant="outline">Manage Tags</Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline">View Orders</Button>
            </Link>
            <Link href="/admin/pricing">
              <Button variant="outline">Edit Pricing</Button>
            </Link>
            {isOwner && (
              <Link href="/admin/users">
                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  Manage Users
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
