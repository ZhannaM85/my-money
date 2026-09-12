export const FRANKFURTER_API_BASE = 'https://api.frankfurter.dev/v2'

/** RUB and GEL are not on Frankfurter/ECB; use static RUB (`rubStatic`) or manual rates. See docs/FX.md. */
export const FRANKFURTER_UNSUPPORTED = ['RUB', 'GEL'] as const

export function isFrankfurterUnsupported(code: string): boolean {
  return (FRANKFURTER_UNSUPPORTED as readonly string[]).includes(code)
}
