export const FRANKFURTER_API_BASE = 'https://api.frankfurter.dev/v2'

/** RUB is handled by the app's own static same-origin dataset instead. */
export const FRANKFURTER_UNSUPPORTED = ['RUB'] as const

export function isFrankfurterUnsupported(code: string): boolean {
  return (FRANKFURTER_UNSUPPORTED as readonly string[]).includes(code)
}
