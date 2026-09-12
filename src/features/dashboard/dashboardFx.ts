/** Converted mode needs FX fetches; Original uses native amounts (#113). */
export function dashboardNeedsRemoteFx(isOriginal: boolean): boolean {
  return !isOriginal
}
