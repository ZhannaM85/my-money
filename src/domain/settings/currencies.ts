export const BASE_CURRENCIES = [
  'EUR',
  'USD',
  'GBP',
  'RUB',
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
