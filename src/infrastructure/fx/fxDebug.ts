import { isNativePlatform } from '@/shared/lib/registerServiceWorker'

const FLAG = 'my-money:fx-debug'
const MAX_ENTRIES = 80

export interface FxDebugEntry {
  at: string
  message: string
  details?: unknown
}

export interface FxDebugSnapshot {
  enabled: boolean
  entries: readonly FxDebugEntry[]
}

export interface EnsureRangeWindow {
  start: string
  end: string
  base: string
  symbols: readonly string[]
  at: string
}

export interface FxRuntimeContext {
  online: boolean | undefined
  platform: 'capacitor' | 'pwa'
  lastEnsureRange: EnsureRangeWindow | undefined
}

const entries: FxDebugEntry[] = []
const listeners = new Set<() => void>()
let lastEnsureRange: EnsureRangeWindow | undefined

let snapshot: FxDebugSnapshot = {
  enabled: false,
  entries: [],
}

function readEnabled(): boolean {
  try {
    return globalThis.localStorage?.getItem(FLAG) === '1'
  } catch {
    return false
  }
}

function publish(): void {
  snapshot = {
    enabled: readEnabled(),
    entries: [...entries],
  }
  for (const listener of listeners) listener()
}

export function getFxDebugSnapshot(): FxDebugSnapshot {
  return snapshot
}

export function isFxDebugEnabled(): boolean {
  return snapshot.enabled || readEnabled()
}

export function setFxDebugEnabled(enabled: boolean): void {
  try {
    if (enabled) {
      globalThis.localStorage?.setItem(FLAG, '1')
    } else {
      globalThis.localStorage?.removeItem(FLAG)
    }
  } catch {
    // ignore quota / private mode
  }
  publish()
}

export function getFxDebugLog(): readonly FxDebugEntry[] {
  return snapshot.entries
}

export function clearFxDebugLog(): void {
  entries.length = 0
  publish()
}

export function subscribeFxDebugLog(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function formatFxDebugLog(
  log: readonly FxDebugEntry[] = snapshot.entries,
): string {
  return log
    .map((entry) => {
      const details =
        entry.details === undefined
          ? ''
          : ` ${JSON.stringify(entry.details)}`
      return `${entry.at} ${entry.message}${details}`
    })
    .join('\n')
}

/** Sync snapshot.enabled with localStorage (e.g. after tests or cold start). */
export function refreshFxDebugFromStorage(): void {
  publish()
}

export function recordEnsureRangeWindow(window: {
  start: string
  end: string
  base: string
  symbols: readonly string[]
}): void {
  lastEnsureRange = {
    ...window,
    at: new Date().toISOString(),
  }
}

export function getFxRuntimeContext(): FxRuntimeContext {
  const online =
    typeof navigator === 'undefined' ? undefined : navigator.onLine
  return {
    online,
    platform: isNativePlatform() ? 'capacitor' : 'pwa',
    lastEnsureRange,
  }
}

export function fxDebug(message: string, details?: unknown): void {
  if (!readEnabled()) return
  entries.push({
    at: new Date().toISOString(),
    message,
    details,
  })
  if (entries.length > MAX_ENTRIES) {
    entries.splice(0, entries.length - MAX_ENTRIES)
  }
  publish()
  if (details === undefined) {
    console.info(`[fx-debug] ${message}`)
    return
  }
  console.info(`[fx-debug] ${message}`, details)
}

// Initialize snapshot from storage once on module load.
publish()
