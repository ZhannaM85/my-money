import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearFxDebugLog,
  fxDebug,
  getFxDebugLog,
  isFxDebugEnabled,
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
})
