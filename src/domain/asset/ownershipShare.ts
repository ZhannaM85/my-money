import type { Asset } from './Asset'

export interface OwnershipShare {
  numerator: number
  denominator: number
}

export function defaultOwnershipShare(): OwnershipShare {
  return { numerator: 1, denominator: 1 }
}

/** Parse a fraction like `1/2`. Empty or `1/1` means full ownership. */
export function parseOwnershipShare(raw: string): OwnershipShare | undefined {
  const trimmed = raw.trim()
  if (trimmed === '' || trimmed === '1') return defaultOwnershipShare()
  const match = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (!match) return undefined
  const numerator = Number(match[1])
  const denominator = Number(match[2])
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator <= 0 ||
    numerator < 0 ||
    numerator > denominator
  ) {
    return undefined
  }
  return { numerator, denominator }
}

export function formatOwnershipShare(
  share: OwnershipShare | undefined,
): string {
  const { numerator, denominator } = share ?? defaultOwnershipShare()
  return `${numerator}/${denominator}`
}

/** Formatted fraction when ownership is not 100% (#151). */
export function partialOwnershipShare(
  asset: Pick<Asset, 'ownershipShareNumerator' | 'ownershipShareDenominator'>,
): string | undefined {
  if (ownershipMultiplier(asset) >= 1) return undefined
  return formatOwnershipShare({
    numerator: asset.ownershipShareNumerator ?? 1,
    denominator: asset.ownershipShareDenominator ?? 1,
  })
}

/** List-row share: always when not 1/1; property also shows 1/1 (#151, #152). */
export function listOwnershipShare(
  asset: Pick<
    Asset,
    'assetClass' | 'ownershipShareNumerator' | 'ownershipShareDenominator'
  >,
): string | undefined {
  const share = formatOwnershipShare({
    numerator: asset.ownershipShareNumerator ?? 1,
    denominator: asset.ownershipShareDenominator ?? 1,
  })
  if (ownershipMultiplier(asset) < 1) return share
  if (asset.assetClass === 'property') return share
  return undefined
}

export function ownershipMultiplier(
  asset: Pick<Asset, 'ownershipShareNumerator' | 'ownershipShareDenominator'>,
): number {
  const numerator = asset.ownershipShareNumerator ?? 1
  const denominator = asset.ownershipShareDenominator ?? 1
  if (denominator <= 0) return 1
  return numerator / denominator
}

export function effectiveAmount(
  amount: number,
  asset: Pick<Asset, 'ownershipShareNumerator' | 'ownershipShareDenominator'>,
): number {
  return amount * ownershipMultiplier(asset)
}
