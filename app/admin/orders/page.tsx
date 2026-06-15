import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import Link from 'next/link'
import { OrdersList } from './orders-list'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

const STATUS_OPTIONS = ['completed', 'shipped', 'cancelled']

interface SearchParams {
  status?: string
  from?: string
  to?: string
  customer?: string
  page?: string
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('orders')
    .select(
      `
      *,
      order_items (
        quantity,
        price_at_purchase,
        signs (
          title,
          images
        )
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }
  if (searchParams.from) {
    query = query.gte('created_at', searchParams.from)
  }
  if (searchParams.to) {
    query = query.lte('created_at', `${searchParams.to}T23:59:59.999Z`)
  }
  if (searchParams.customer) {
    query = query.ilike('customer_email', `%${searchParams.customer}%`)
  }

  const { data: orders, count } = await query

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  const buildUrl = (params: Partial<SearchParams>) => {
    const merged = { ...searchParams, ...params }
    const qs = new URLSearchParams()
    if (merged.status) qs.set('status', merged.status)
    if (merged.from) qs.set('from', merged.from)
    if (merged.to) qs.set('to', merged.to)
    if (merged.customer) qs.set('customer', merged.customer)
    if (merged.page && merged.page !== '1') qs.set('page', merged.page)
    const s = qs.toString()
    return s ? `/admin/orders?${s}` : '/admin/orders'
  }

  const filterParams = new URLSearchParams()
  if (searchParams.status) filterParams.set('status', searchParams.status)
  if (searchParams.from) filterParams.set('from', searchParams.from)
  if (searchParams.to) filterParams.set('to', searchParams.to)
  if (searchParams.customer) filterParams.set('customer', searchParams.customer)
  const filterQs = filterParams.toString()
  const exportUrl = `/api/admin/orders/export-usps${filterQs ? `?${filterQs}` : ''}`
  const packingSlipsUrl = `/admin/orders/packing-slips${filterQs ? `?${filterQs}` : ''}`

  const hasFilters = !!(
    searchParams.status ||
    searchParams.from ||
    searchParams.to ||
    searchParams.customer
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Orders</h2>
        <div className="flex gap-2">
          <Link href={packingSlipsUrl} target="_blank">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Print Packing Slips
            </Button>
          </Link>
          <a href={exportUrl}>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download USPS CSV
            </Button>
          </a>
        </div>
      </div>

      <form method="get" className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Customer Email</label>
          <input
            type="text"
            name="customer"
            placeholder="Search email..."
            defaultValue={searchParams.customer ?? ''}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            name="status"
            defaultValue={searchParams.status ?? ''}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
          <input
            type="date"
            name="from"
            defaultValue={searchParams.from ?? ''}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
          <input
            type="date"
            name="to"
            defaultValue={searchParams.to ?? ''}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
        </div>
        <Button type="submit">Filter</Button>
        {hasFilters && (
          <Link href="/admin/orders" className="text-sm text-gray-600 hover:text-black underline">
            Clear filters
          </Link>
        )}
      </form>

      <OrdersList orders={orders ?? []} />

      {(orders?.length ?? 0) === 0 && (
        <div className="text-center text-gray-500 py-12">No orders match these filters.</div>
      )}

      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-gray-600">
          Showing {count === 0 ? 0 : offset + 1}–{Math.min(offset + PAGE_SIZE, count ?? 0)} of {count ?? 0}
        </p>
        <div className="flex gap-2">
          {page <= 1 ? (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          ) : (
            <Link href={buildUrl({ page: String(page - 1) })}>
              <Button variant="outline" size="sm">
                Previous
              </Button>
            </Link>
          )}
          {page >= totalPages ? (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          ) : (
            <Link href={buildUrl({ page: String(page + 1) })}>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
