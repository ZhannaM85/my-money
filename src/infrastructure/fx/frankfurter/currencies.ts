export const FRANKFURTER_API_BASE = 'https://api.frankfurter.dev/v1'

/** ECB/Frankfurter does not publish these — use CBR for RUB crosses. */
export const FRANKFURTER_UNSUPPORTED = ['RUB'] as const

export function isFrankfurterUnsupported(code: string): boolean {
  return (FRANKFURTER_UNSUPPORTED as readonly string[]).includes(code)
}
