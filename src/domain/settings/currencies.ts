/** Settings base-currency option: keep native amounts instead of one converted total. */
export const SHOW_ALL_CURRENCIES = 'all' as const

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
