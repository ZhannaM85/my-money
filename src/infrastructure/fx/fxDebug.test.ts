import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fxDebug, isFxDebugEnabled } from './fxDebug'

describe('fxDebug', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('is off by default', () => {
    expect(isFxDebugEnabled()).toBe(false)
  })

  it('logs only when the localStorage flag is set', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    fxDebug('silent')
    expect(info).not.toHaveBeenCalled()

    localStorage.setItem('my-money:fx-debug', '1')
    fxDebug('hello', { code: 'EUR' })
    expect(info).toHaveBeenCalledWith('[fx-debug] hello', { code: 'EUR' })
  })
})
