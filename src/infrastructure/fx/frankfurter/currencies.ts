export const FRANKFURTER_API_BASE = 'https://api.frankfurter.dev/v2'

/** Frankfurter v2 covers RUB, so we no longer special-case it out. */
export const FRANKFURTER_UNSUPPORTED: readonly string[] = []

export function isFrankfurterUnsupported(code: string): boolean {
  return (FRANKFURTER_UNSUPPORTED as readonly string[]).includes(code)
}
