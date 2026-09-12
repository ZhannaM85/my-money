import type { AssetClass } from '@/domain/asset'

export interface ClassTotal {
  assetClass: AssetClass
  amount: number
}

export interface MissingRate {
  assetId: string
  from: string
  to: string
  date: string
}

export interface NetWorthResult {
  total: number
  byClass: ClassTotal[]
  missingRates: MissingRate[]
}

export type AllocationHolding = {
  assetId: string
  name: string
  institution?: string
  amount: number
  currency: string
  ownershipShare?: string
  excluded?: boolean
}

export interface HoldingConversion {
  assetId: string
  name: string
  currency: string
  nativeAmount: number
  /** Base-currency amount when a rate exists; otherwise null. */
  convertedAmount: number | null
  conversionAvailable: boolean
  note?: string
  institution?: string
  /** Set when ownership is not 1/1, or always for property (#151, #152). */
  ownershipShare?: string
  /** Dashboard-hidden via swipe; still listed, not in totals (#146). */
  excluded?: boolean
}

export interface HistoricalPoint {
  date: string
  total: number
  missingRates: MissingRate[]
  holdings: HoldingConversion[]
}

export type NativeAllocationRow = {
  id: string
  amount: number
  percent: number
  currency: string
  shareWeight: number
  conversionAvailable: boolean
}
