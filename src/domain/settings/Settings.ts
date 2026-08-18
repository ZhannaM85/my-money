import type { Locale } from './detectLocale'

export const SETTINGS_ID = 'singleton' as const
export type CurrencyDisplayMode = 'base' | 'native'

export interface Settings {
  id: typeof SETTINGS_ID
  baseCurrency: string
  currencyDisplayMode: CurrencyDisplayMode
  locale: Locale
  onboardingCompleted: boolean
  updatedAt: string
}

export const DEFAULT_SETTINGS: Settings = {
  id: SETTINGS_ID,
  baseCurrency: 'EUR',
  currencyDisplayMode: 'base',
  locale: 'en',
  onboardingCompleted: false,
  updatedAt: '1970-01-01T00:00:00.000Z',
}

export function shouldShowOnboarding(
  assetCount: number,
  onboardingCompleted: boolean,
): boolean {
  return assetCount === 0 && !onboardingCompleted
}
