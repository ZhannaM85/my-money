export type Locale = 'en' | 'ru'

export function detectDefaultLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}
