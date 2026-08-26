/** Converted mode needs FX fetches; Original uses native amounts (#113). */
export function dashboardNeedsRemoteFx(isOriginal: boolean): boolean {
  return !isOriginal
}

/** Skip Frankfurter when the browser reports offline (#113). */
export function shouldFetchFrankfurter(online: boolean): boolean {
  return online
}
