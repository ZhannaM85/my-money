/** Converted mode needs FX fetches; Original uses native amounts (#113). */
export function dashboardNeedsRemoteFx(isOriginal: boolean): boolean {
  return !isOriginal
}

/** Plain FX subheader: missing-rate only; no disclaimer when quotes exist (#302). */
export function dashboardFxNote({
  isOriginal,
  missingCodes,
  fxMissing,
}: {
  isOriginal: boolean
  missingCodes: readonly string[]
  fxMissing: (codes: string) => string
}): string | undefined {
  if (isOriginal) return undefined
  if (missingCodes.length > 0) return fxMissing(missingCodes.join(', '))
  return undefined
}
