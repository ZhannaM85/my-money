import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearFxDebugLog,
  fxDebug,
  getFxDebugLog,
  getFxRuntimeContext,
  isFxDebugEnabled,
  recordEnsureRangeWindow,
  setFxDebugEnabled,
} from './fxDebug'

describe('fxDebug', () => {
  beforeEach(() => {
    localStorage.clear()
    clearFxDebugLog()
    setFxDebugEnabled(false)
    vi.restoreAllMocks()
  })

  it('is off by default', () => {
    expect(isFxDebugEnabled()).toBe(false)
  })

  it('logs only when enabled and keeps an in-memory buffer', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    fxDebug('silent')
    expect(info).not.toHaveBeenCalled()
    expect(getFxDebugLog()).toHaveLength(0)

    setFxDebugEnabled(true)
    fxDebug('hello', { code: 'EUR' })
    expect(info).toHaveBeenCalledWith('[fx-debug] hello', { code: 'EUR' })
    expect(getFxDebugLog()).toHaveLength(1)
  })

  it('records the last ensureRange window even when debug is off (#196)', () => {
    recordEnsureRangeWindow({
      start: '2026-08-01',
      end: '2026-08-31',
      base: 'RUB',
      symbols: ['USD', 'GEL'],
    })
    const context = getFxRuntimeContext()
    expect(context.platform).toBe('pwa')
    expect(context.lastEnsureRange?.start).toBe('2026-08-01')
    expect(context.lastEnsureRange?.end).toBe('2026-08-31')
    expect(context.lastEnsureRange?.symbols).toEqual(['USD', 'GEL'])
    expect(typeof context.online).toBe('boolean')
  })
})
