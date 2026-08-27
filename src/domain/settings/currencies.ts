/** Settings base-currency option: keep native amounts instead of one converted total. */
export const SHOW_ALL_CURRENCIES = 'all' as const

/** Hidden FX base for Allocation share % when Show all currencies is on (#121). */
export const ALLOCATION_ALL_SHARE_BASE = 'RUB' as const

export const BASE_CURRENCIES = [
  'EUR',
  'USD',
  'GBP',
  'RUB',
  'GEL',
  'CHF',
  'JPY',
  'CAD',
  'AUD',
  'PLN',
  'SEK',
  'NOK',
  'DKK',
  'CNY',
  'INR',
] as const

export type BaseCurrency = (typeof BASE_CURRENCIES)[number]
