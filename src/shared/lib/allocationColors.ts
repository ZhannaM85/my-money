const CLASS_COLORS: Record<string, string> = {
  money: 'var(--asset-money)',
  investments: 'var(--asset-investments)',
  property: 'var(--asset-property)',
  valuables: 'var(--asset-valuables)',
  liabilities: 'var(--asset-liabilities)',
}

/** One hue per type so Type-view sectors do not collapse to the class color (#269). */
const TYPE_COLORS: Record<string, string> = {
  bank: 'var(--asset-bank)',
  savings: 'var(--asset-savings)',
  cash: 'var(--asset-cash)',
  deposit: 'var(--asset-deposit)',
  debit_card: 'var(--asset-debit-card)',
  brokerage: 'var(--asset-brokerage)',
  stocks: 'var(--asset-stocks)',
  etf: 'var(--asset-etf)',
  bonds: 'var(--asset-bonds)',
  crypto: 'var(--asset-crypto)',
  other_investment: 'var(--asset-other)',
  apartment: 'var(--asset-apartment)',
  house: 'var(--asset-house)',
  land: 'var(--asset-land)',
  vehicle: 'var(--asset-vehicles)',
  jewelry: 'var(--asset-valuables)',
  watch: 'var(--asset-watch)',
  electronics: 'var(--asset-electronics)',
  collectible: 'var(--asset-collectible)',
  other_valuable: 'var(--asset-other-valuable)',
  mortgage: 'var(--asset-liabilities)',
  personal_loan: 'var(--asset-personal-loan)',
  credit_card: 'var(--asset-credit-card)',
  other_debt: 'var(--asset-other-debt)',
}

const CURRENCY_COLORS: Record<string, string> = {
  EUR: 'var(--currency-eur)',
  USD: 'var(--currency-usd)',
  GBP: 'var(--currency-gbp)',
  RUB: 'var(--currency-rub)',
  GEL: 'var(--currency-gel)',
  BTC: 'var(--currency-btc)',
  USDT: 'var(--currency-usdt)',
}

const FALLBACK = [
  'var(--currency-eur)',
  'var(--currency-usd)',
  'var(--currency-rub)',
  'var(--currency-gel)',
  'var(--currency-gbp)',
  'var(--asset-cash)',
  'var(--asset-debit-card)',
  'var(--asset-house)',
  'var(--asset-vehicles)',
  'var(--asset-crypto)',
  'var(--asset-deposit)',
  'var(--asset-other)',
]

/** Slice color by class / type / currency id — not list index (#255, #269). */
export function allocationSliceColor(id: string): string {
  const key = id.includes('::') ? id.slice(0, id.indexOf('::')) : id
  const classColor = CLASS_COLORS[key]
  if (classColor) return classColor
  const typeColor = TYPE_COLORS[key]
  if (typeColor) return typeColor
  const currencyColor = CURRENCY_COLORS[key]
  if (currencyColor) return currencyColor
  let hash = 0
  for (const char of key) hash = (hash + char.charCodeAt(0)) % FALLBACK.length
  return FALLBACK[hash] ?? CLASS_COLORS.money
}
