const CLASS_COLORS: Record<string, string> = {
  money: 'var(--asset-money)',
  investments: 'var(--asset-investments)',
  property: 'var(--asset-property)',
  valuables: 'var(--asset-valuables)',
  liabilities: 'var(--asset-liabilities)',
}

const TYPE_TO_CLASS: Record<string, keyof typeof CLASS_COLORS> = {
  bank: 'money',
  savings: 'money',
  cash: 'money',
  deposit: 'money',
  debit_card: 'money',
  brokerage: 'investments',
  stocks: 'investments',
  etf: 'investments',
  bonds: 'investments',
  crypto: 'investments',
  other_investment: 'investments',
  apartment: 'property',
  house: 'property',
  land: 'property',
  vehicle: 'property',
  jewelry: 'valuables',
  watch: 'valuables',
  electronics: 'valuables',
  collectible: 'valuables',
  other_valuable: 'valuables',
  mortgage: 'liabilities',
  personal_loan: 'liabilities',
  credit_card: 'liabilities',
  other_debt: 'liabilities',
}

const CURRENCY_COLORS: Record<string, string> = {
  EUR: 'var(--currency-eur)',
  USD: 'var(--currency-usd)',
  GBP: 'var(--currency-gbp)',
  RUB: 'var(--currency-rub)',
}

const FALLBACK = Object.values(CLASS_COLORS)

/** Slice color by class / type / currency id — not list index (#255). */
export function allocationSliceColor(id: string): string {
  const key = id.includes('::') ? id.slice(0, id.indexOf('::')) : id
  const classColor = CLASS_COLORS[key]
  if (classColor) return classColor
  const typeClass = TYPE_TO_CLASS[key]
  if (typeClass) return CLASS_COLORS[typeClass]
  const currencyColor = CURRENCY_COLORS[key]
  if (currencyColor) return currencyColor
  let hash = 0
  for (const char of key) hash = (hash + char.charCodeAt(0)) % FALLBACK.length
  return FALLBACK[hash] ?? CLASS_COLORS.money
}
