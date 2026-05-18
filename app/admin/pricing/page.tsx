'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import type { PricingTier } from '@/lib/pricing'

interface EditState {
  [id: string]: { price: string; overflow_unit_price: string; label: string }
}

export default function AdminPricingPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [edits, setEdits] = useState<EditState>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState<string | null>(null)

  async function loadTiers() {
    const res = await fetch('/api/pricing')
    const data = await res.json()
    setTiers(data.tiers ?? [])
    const initial: EditState = {}
    for (const t of data.tiers ?? []) {
      initial[t.id] = {
        price: (t.price / 100).toFixed(2),
        overflow_unit_price: t.overflow_unit_price != null ? (t.overflow_unit_price / 100).toFixed(2) : '',
        label: t.label,
      }
    }
    setEdits(initial)
    setLoading(false)
  }

  useEffect(() => { loadTiers() }, [])

  async function saveTier(id: string) {
    setSaving(id)
    setError('')
    const edit = edits[id]
    const price = Math.round(parseFloat(edit.price) * 100)
    const overflow = edit.overflow_unit_price ? Math.round(parseFloat(edit.overflow_unit_price) * 100) : null

    const res = await fetch(`/api/admin/pricing/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price, overflow_unit_price: overflow, label: edit.label }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Save failed')
    } else {
      setSaved(id)
      setTimeout(() => setSaved(null), 2000)
      await loadTiers()
    }
    setSaving(null)
  }

  const bagTiers = tiers.filter((t) => t.product_type === 'bag').sort((a, b) => a.display_order - b.display_order)
  const paperTiers = tiers.filter((t) => t.product_type !== 'bag').sort((a, b) => a.display_order - b.display_order)

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-500">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-1">Pricing</h2>
        <p className="text-gray-500 text-sm">Changes take effect immediately for all customers.</p>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

      {/* Bag Bundle Pricing */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="font-semibold text-lg">Bag Sign Bundle Pricing</h3>
          <p className="text-sm text-gray-500">Shipping included in price. Applied based on total bag signs in cart.</p>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bundle Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Per Additional (overflow)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bagTiers.map((tier) => {
              const edit = edits[tier.id]
              if (!edit) return null
              return (
                <tr key={tier.id}>
                  <td className="px-6 py-4">
                    <input
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-40"
                      value={edit.label}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [tier.id]: { ...prev[tier.id], label: e.target.value } }))}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                        value={edit.price}
                        onChange={(e) => setEdits((prev) => ({ ...prev, [tier.id]: { ...prev[tier.id], price: e.target.value } }))}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {tier.max_qty === null ? (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="—"
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                          value={edit.overflow_unit_price}
                          onChange={(e) => setEdits((prev) => ({ ...prev, [tier.id]: { ...prev[tier.id], overflow_unit_price: e.target.value } }))}
                        />
                        <span className="text-gray-400 text-xs">per bag</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      disabled={saving === tier.id}
                      onClick={() => saveTier(tier.id)}
                    >
                      {saving === tier.id ? 'Saving...' : saved === tier.id ? 'Saved ✓' : 'Save'}
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paper Sign Pricing */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="font-semibold text-lg">Paper Sign Pricing</h3>
          <p className="text-sm text-gray-500">Per-unit price and flat shipping fee.</p>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paperTiers.map((tier) => {
              const edit = edits[tier.id]
              if (!edit) return null
              return (
                <tr key={tier.id}>
                  <td className="px-6 py-4 text-sm text-gray-700">{tier.label}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                        value={edit.price}
                        onChange={(e) => setEdits((prev) => ({ ...prev, [tier.id]: { ...prev[tier.id], price: e.target.value } }))}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      disabled={saving === tier.id}
                      onClick={() => saveTier(tier.id)}
                    >
                      {saving === tier.id ? 'Saving...' : saved === tier.id ? 'Saved ✓' : 'Save'}
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">Note on 5–6 bag pricing</p>
        <p>Buck did not specify pricing for 5 or 6 bags. Currently set to $34.99 (same as 7). Confirm with Buck and update above.</p>
      </div>
    </div>
  )
}
