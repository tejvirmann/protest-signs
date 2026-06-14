'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Loader2 } from 'lucide-react'

const PRESET_AMOUNTS = [5, 10, 20, 50]

export default function DonatePage() {
  const [selected, setSelected] = useState<number | null>(20)
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const amount = selected ?? parseFloat(customAmount)

  const handlePreset = (value: number) => {
    setSelected(value)
    setCustomAmount('')
  }

  const handleCustomChange = (value: string) => {
    setCustomAmount(value)
    setSelected(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!Number.isFinite(amount) || amount < 1) {
      setError('Please enter an amount of at least $1.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/stripe/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start checkout')
      }

      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Heart className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Support Our Work</h1>
          <p className="text-xl text-gray-600">
            Don&apos;t need a sign right now? Make a contribution of any amount to help keep us
            going.
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Choose an amount</CardTitle>
            <CardDescription>You&apos;ll be taken to Stripe to complete your payment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
              )}

              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handlePreset(value)}
                    className={`rounded-md border py-3 text-sm font-semibold transition-colors ${
                      selected === value
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    ${value}
                  </button>
                ))}
              </div>

              <div>
                <label htmlFor="custom-amount" className="block text-sm font-medium mb-2">
                  Or enter a custom amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="custom-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    inputMode="decimal"
                    value={customAmount}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder="25.00"
                    className="pl-7"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  `Donate ${Number.isFinite(amount) && amount > 0 ? `$${amount.toFixed(2)}` : ''}`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
