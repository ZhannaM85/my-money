export const ASSET_CLASSES = [
  'money',
  'investments',
  'property',
  'valuables',
  'liabilities',
] as const

export type AssetClass = (typeof ASSET_CLASSES)[number]

export const TRACKING_STATUSES = ['included', 'excluded', 'archived'] as const
export type TrackingStatus = (typeof TRACKING_STATUSES)[number]

export const VALUATION_METHODS = [
  'account_balance',
  'my_estimate',
  'appraisal',
  'market_price',
  'purchase_price',
] as const
export type ValuationMethod = (typeof VALUATION_METHODS)[number]

export const UPDATE_FREQUENCIES = [
  'weekly',
  'monthly',
  'yearly',
  'manual',
] as const
export type UpdateFrequency = (typeof UPDATE_FREQUENCIES)[number]

export const ASSET_TYPES = [
  'bank',
  'savings',
  'cash',
  'deposit',
  'debit_card',
  'brokerage',
  'stocks',
  'etf',
  'bonds',
  'crypto',
  'other_investment',
  'apartment',
  'house',
  'land',
  'vehicle',
  'jewelry',
  'watch',
  'electronics',
  'collectible',
  'other_valuable',
  'mortgage',
  'personal_loan',
  'credit_card',
  'other_debt',
] as const

export type AssetType = (typeof ASSET_TYPES)[number]

export interface Asset {
  id: string
  name: string
  assetClass: AssetClass
  type: AssetType
  currency: string
  institution?: string
  trackingStatus: TrackingStatus
  valuationMethod: ValuationMethod
  purchaseValue?: number
  ownershipShareNumerator?: number
  ownershipShareDenominator?: number
  updateFrequency: UpdateFrequency
  createdAt: string
  updatedAt: string
}

export function isLiability(asset: Pick<Asset, 'assetClass'>): boolean {
  return asset.assetClass === 'liabilities'
}

export function contributesToNetWorth(
  asset: Pick<Asset, 'trackingStatus'>,
): boolean {
  return asset.trackingStatus === 'included'
}
