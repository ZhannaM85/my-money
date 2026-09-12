import type { Asset, AssetClass } from '@/domain/asset'
import {
  effectiveAmount,
  isLiability,
  listOwnershipShare,
} from '@/domain/asset'
import { convertAmount, lookupRate, type RateTable } from '@/domain/fx'
import type { AssetSnapshot } from '@/domain/snapshot'
import type { HoldingConversion, MissingRate } from './types'

export function emptyByClass(): { assetClass: AssetClass; amount: number }[] {
  return [
    { assetClass: 'money', amount: 0 },
    { assetClass: 'investments', amount: 0 },
    { assetClass: 'property', amount: 0 },
    { assetClass: 'valuables', amount: 0 },
    { assetClass: 'liabilities', amount: 0 },
  ]
}

export function convertedContribution(
  asset: Asset,
  snapshot: AssetSnapshot,
  rates: RateTable,
  baseCurrency: string,
  rateDate: string,
  rateLookup: typeof lookupRate = lookupRate,
): { amount: number } | { missing: MissingRate } {
  const rate = rateLookup(rates, snapshot.currency, baseCurrency, rateDate)
  if (rate === undefined) {
    return {
      missing: {
        assetId: asset.id,
        from: snapshot.currency,
        to: baseCurrency,
        date: rateDate,
      },
    }
  }
  const native = effectiveAmount(convertAmount(snapshot.amount, rate), asset)
  return { amount: isLiability(asset) ? -native : native }
}

export function toHoldingConversion(
  asset: Asset,
  snapshot: AssetSnapshot,
  nativeAmount: number,
  convertedAmount: number | null,
  conversionAvailable: boolean,
): HoldingConversion {
  const ownershipShare = listOwnershipShare(asset)
  return {
    assetId: asset.id,
    name: asset.name,
    currency: snapshot.currency,
    nativeAmount,
    convertedAmount,
    conversionAvailable,
    ...(snapshot.note ? { note: snapshot.note } : {}),
    ...(asset.institution?.trim()
      ? { institution: asset.institution.trim() }
      : {}),
    ...(ownershipShare ? { ownershipShare } : {}),
    ...(asset.trackingStatus === 'excluded' ? { excluded: true } : {}),
  }
}
