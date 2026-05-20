export interface PricingTier {
  id: string
  product_type: string
  min_qty: number
  max_qty: number | null
  price: number
  overflow_unit_price: number | null
  label: string
  display_order: number
}

export function computeBagPrice(qty: number, tiers: PricingTier[]): number {
  if (qty <= 0) return 0
  const bagTiers = tiers
    .filter((t) => t.product_type === 'bag')
    .sort((a, b) => a.display_order - b.display_order)

  for (const tier of bagTiers) {
    const inRange = qty >= tier.min_qty && (tier.max_qty === null || qty <= tier.max_qty)
    if (inRange) {
      if (tier.max_qty === null && tier.overflow_unit_price != null) {
        return tier.price + (qty - tier.min_qty) * tier.overflow_unit_price
      }
      return tier.price
    }
  }
  // Fallback: last tier
  const last = bagTiers[bagTiers.length - 1]
  if (!last) return 0
  if (last.overflow_unit_price != null) {
    return last.price + (qty - last.min_qty) * last.overflow_unit_price
  }
  return last.price
}

export function getPaperUnitPrice(tiers: PricingTier[]): number {
  return tiers.find((t) => t.product_type === 'paper')?.price ?? 499
}

export function getPaperShipping(tiers: PricingTier[]): number {
  return tiers.find((t) => t.product_type === 'paper_shipping')?.price ?? 2000
}

export function getBagTiers(tiers: PricingTier[]): PricingTier[] {
  return tiers
    .filter((t) => t.product_type === 'bag')
    .sort((a, b) => a.display_order - b.display_order)
}
