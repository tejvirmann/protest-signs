// Column headers for USPS Click-N-Ship's bulk "File Upload" template
// (see buck-comments-3/Label_Template.csv) — order matters.
export const USPS_CSV_HEADERS = [
  'Reference ID', 'Reference ID 2', 'Shipping Date', 'Item Description', 'Item Quantity',
  'Item Weight (lb)', 'Item Weight (oz)', 'Item Value', 'HS Tariff #', 'Country of Origin',
  'Sender First Name', 'Sender Middle Initial', 'Sender Last Name', 'Sender Company/Org Name',
  'Sender Address Line 1', 'Sender Address Line 2', 'Sender Address Line 3', 'Sender Address Town/City',
  'Sender State', 'Sender Country', 'Sender ZIP Code', 'Sender Urbanization Code',
  'Ship From Another ZIP Code', 'Sender Email', 'Sender Cell Phone',
  'Recipient Country', 'Recipient First Name', 'Recipient Middle Initial', 'Recipient Last Name',
  'Recipient Company/Org Name', 'Recipient Address Line 1', 'Recipient Address Line 2', 'Recipient Address Line 3',
  'Recipient Address Town/City', 'Recipient Province', 'Recipient State', 'Recipient ZIP Code',
  'Recipient Urbanization Code', 'Recipient Phone', 'Recipient Email',
  'Service Type', 'Package Type', 'Package Weight (lb)', 'Package Weight (oz)',
  'Length', 'Width', 'Height', 'Girth', 'Insured Value', 'Contents', 'Contents Description',
  'Package Comments', 'Customs Form Reference #', 'License #', 'Certificate #', 'Invoice #',
  'Customs Form Reference # Type', 'HAZMAT Type', 'Live Animals and Perishable Goods Indicator',
] as const

export interface UspsSender {
  name: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zip: string
  email: string
  phone: string
}

export interface UspsOrderItem {
  title: string
  quantity: number
  weightOz: number | null
  priceAtPurchaseCents: number
}

export interface UspsOrder {
  id: string
  customerEmail: string | null
  shippingName: string | null
  shippingPhone: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  items: UspsOrderItem[]
}

function csvField(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value)
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function ozToLbOz(totalOz: number): { lb: number; oz: number } {
  const lb = Math.floor(totalOz / 16)
  const oz = totalOz % 16
  return { lb, oz }
}

function splitName(fullName: string | null): { first: string; last: string } {
  if (!fullName) return { first: '', last: '' }
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { first: parts[0], last: '' }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

// USPS wants 10-digit US phone numbers with no country code/formatting.
function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return digits
}

function todayMMDDYYYY(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mm}/${dd}/${d.getFullYear()}`
}

export function buildUspsCsv(orders: UspsOrder[], sender: UspsSender): string {
  const lines = [USPS_CSV_HEADERS.map(csvField).join(',')]

  for (const order of orders) {
    const { first, last } = splitName(order.shippingName)

    const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0)
    const totalWeightOz = order.items.reduce((sum, i) => sum + (i.weightOz ?? 0) * i.quantity, 0)
    const itemWeightOz = totalQty > 0 ? Math.round(totalWeightOz / totalQty) : 0
    const itemValue = order.items.reduce((sum, i) => sum + i.priceAtPurchaseCents * i.quantity, 0) / 100

    const description = order.items
      .map((i) => (i.quantity > 1 ? `${i.title} x${i.quantity}` : i.title))
      .join(', ')
      .slice(0, 15)

    const itemW = ozToLbOz(itemWeightOz)
    const pkgW = ozToLbOz(totalWeightOz)

    const row: (string | number)[] = [
      order.id.slice(0, 8).toUpperCase(), // Reference ID
      '', // Reference ID 2
      todayMMDDYYYY(), // Shipping Date
      description, // Item Description
      totalQty, // Item Quantity
      itemW.lb, // Item Weight (lb)
      itemW.oz, // Item Weight (oz)
      itemValue.toFixed(2), // Item Value
      '', '', // HS Tariff #, Country of Origin
      '', '', '', // Sender First/Middle/Last Name
      sender.name, // Sender Company/Org Name
      sender.addressLine1,
      sender.addressLine2,
      '', // Sender Address Line 3
      sender.city,
      sender.state,
      'US', // Sender Country
      sender.zip,
      '', // Sender Urbanization Code
      '', // Ship From Another ZIP Code
      sender.email,
      formatPhone(sender.phone),
      'US', // Recipient Country
      first,
      '', // Recipient Middle Initial
      last,
      '', // Recipient Company/Org Name
      order.addressLine1 ?? '',
      order.addressLine2 ?? '',
      '', // Recipient Address Line 3
      order.city ?? '',
      '', // Recipient Province
      order.state ?? '',
      order.postalCode ?? '',
      '', // Recipient Urbanization Code
      formatPhone(order.shippingPhone),
      order.customerEmail ?? '',
      'USPS Ground Advantage', // Service Type
      'Custom Packaging', // Package Type
      pkgW.lb,
      pkgW.oz,
      '', '', '', '', // Length, Width, Height, Girth — fill in based on actual packaging
      '', '', '', '', // Insured Value, Contents, Contents Description, Package Comments
      '', '', '', '', // Customs Form Reference #, License #, Certificate #, Invoice #
      '', '', '', // Customs Form Reference # Type, HAZMAT Type, Live Animals/Perishable
    ]

    lines.push(row.map(csvField).join(','))
  }

  return lines.join('\r\n') + '\r\n'
}
