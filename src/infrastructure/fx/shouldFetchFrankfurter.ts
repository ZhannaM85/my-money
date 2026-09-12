/** Skip Frankfurter when the browser reports offline (#113, #242). */
export function shouldFetchFrankfurter(online: boolean): boolean {
  return online
}
