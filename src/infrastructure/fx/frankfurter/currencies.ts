export const FRANKFURTER_API_BASE = 'https://api.frankfurter.dev/v1'

/** ECB/Frankfurter does not publish these. Do not invent a second provider. */
export const FRANKFURTER_UNSUPPORTED = ['RUB'] as const

export function isFrankfurterUnsupported(code: string): boolean {
  return (FRANKFURTER_UNSUPPORTED as readonly string[]).includes(code)
}
