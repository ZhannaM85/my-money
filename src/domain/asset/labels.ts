import type { AssetClass, AssetType } from './Asset'

export const TYPES_BY_CLASS: Record<AssetClass, readonly AssetType[]> = {
  money: ['bank', 'savings', 'cash', 'deposit'],
  investments: [
    'brokerage',
    'stocks',
    'etf',
    'bonds',
    'crypto',
    'other_investment',
  ],
  property: ['vehicle', 'apartment', 'house', 'land'],
  valuables: [
    'jewelry',
    'watch',
    'electronics',
    'collectible',
    'other_valuable',
  ],
  liabilities: ['mortgage', 'personal_loan', 'credit_card', 'other_debt'],
}

export const CLASS_LABELS: Record<AssetClass, string> = {
  money: 'Money',
  investments: 'Investments',
  property: 'Property',
  valuables: 'Valuables',
  liabilities: 'Liabilities',
}

export const TYPE_LABELS: Record<AssetType, string> = {
  bank: 'Bank account',
  savings: 'Savings',
  cash: 'Cash',
  deposit: 'Deposit',
  brokerage: 'Brokerage',
  stocks: 'Stocks',
  etf: 'ETF',
  bonds: 'Bonds',
  crypto: 'Crypto',
  other_investment: 'Other investment',
  apartment: 'Apartment',
  house: 'House',
  land: 'Land',
  vehicle: 'Vehicle',
  jewelry: 'Jewelry',
  watch: 'Watch',
  electronics: 'Electronics',
  collectible: 'Collectible',
  other_valuable: 'Other valuable',
  mortgage: 'Mortgage',
  personal_loan: 'Personal loan',
  credit_card: 'Credit card',
  other_debt: 'Other debt',
}

export const VALUATION_LABELS = {
  account_balance: 'Account balance',
  my_estimate: 'My estimate',
  appraisal: 'Appraisal',
  market_price: 'Market price',
  purchase_price: 'Purchase price',
} as const

export const FREQUENCY_LABELS = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  manual: 'Manual only',
} as const

export const TRACKING_LABELS = {
  included: 'Included',
  excluded: 'Excluded',
  archived: 'Archived',
} as const
