export const SETTINGS_ID = 'singleton' as const

export interface Settings {
  id: typeof SETTINGS_ID
  baseCurrency: string
  locale: 'en' | 'ru'
  updatedAt: string
}

export const DEFAULT_SETTINGS: Settings = {
  id: SETTINGS_ID,
  baseCurrency: 'EUR',
  locale: 'en',
  updatedAt: '1970-01-01T00:00:00.000Z',
}
