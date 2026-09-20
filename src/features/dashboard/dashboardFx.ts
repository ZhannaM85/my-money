/** Converted mode needs FX fetches; Original uses native amounts (#113). */
export function dashboardNeedsRemoteFx(isOriginal: boolean): boolean {
  return !isOriginal
}

/** Plain FX subheader: missing-rate vs disclaimer, not one jargon paragraph (#277). */
export function dashboardFxNote({
  isOriginal,
  missingCodes,
  fxMissing,
  fxDisclaimer,
}: {
  isOriginal: boolean
  missingCodes: readonly string[]
  fxMissing: (codes: string) => string
  fxDisclaimer: string
}): string | undefined {
  if (isOriginal) return undefined
  if (missingCodes.length > 0) return fxMissing(missingCodes.join(', '))
  return fxDisclaimer
}
