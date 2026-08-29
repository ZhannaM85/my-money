import type { Locale } from './detectLocale'

export const SETTINGS_ID = 'singleton' as const
export type CurrencyDisplayMode = 'base' | 'native'
export const ASSET_LIST_SORTS = [
  'custom',
  'name_asc',
  'name_desc',
  'amount_asc',
  'amount_desc',
] as const
export type AssetListSort = (typeof ASSET_LIST_SORTS)[number]

export interface Settings {
  id: typeof SETTINGS_ID
  baseCurrency: string
  currencyDisplayMode: CurrencyDisplayMode
  locale: Locale
  onboardingCompleted: boolean
  assetListSort: AssetListSort
  assetListOrder: string[]
  /** Holdings popover on net-worth charts (#141). Default on. */
  showChartTooltip: boolean
  updatedAt: string
}

export const DEFAULT_SETTINGS: Settings = {
  id: SETTINGS_ID,
  baseCurrency: 'EUR',
  currencyDisplayMode: 'base',
  locale: 'en',
  onboardingCompleted: false,
  assetListSort: 'custom',
  assetListOrder: [],
  showChartTooltip: true,
  updatedAt: '1970-01-01T00:00:00.000Z',
}

export function shouldShowOnboarding(
  assetCount: number,
  onboardingCompleted: boolean,
): boolean {
  return assetCount === 0 && !onboardingCompleted
}
