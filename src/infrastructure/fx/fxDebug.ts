const FLAG = 'my-money:fx-debug'

/** Enable in Safari/Web Inspector: `localStorage.setItem('my-money:fx-debug','1')` */
export function isFxDebugEnabled(): boolean {
  try {
    return globalThis.localStorage?.getItem(FLAG) === '1'
  } catch {
    return false
  }
}

export function fxDebug(message: string, details?: unknown): void {
  if (!isFxDebugEnabled()) return
  if (details === undefined) {
    console.info(`[fx-debug] ${message}`)
    return
  }
  console.info(`[fx-debug] ${message}`, details)
}
