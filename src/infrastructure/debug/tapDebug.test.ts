import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearFxDebugLog,
  getFxDebugLog,
  setFxDebugEnabled,
} from '@/infrastructure/fx/fxDebug'
import { tapDebug } from './tapDebug'

describe('tapDebug (#157)', () => {
  beforeEach(() => {
    localStorage.clear()
    clearFxDebugLog()
    setFxDebugEnabled(false)
  })

  it('writes Allocation tap rows into the FX debug log when enabled', () => {
    const target = document.createElement('button')
    target.setAttribute('aria-label', 'Show Sosnovo')
    target.textContent = 'Show'
    tapDebug(
      'reveal-click',
      {
        type: 'click',
        clientX: 10,
        clientY: 20,
        target,
        currentTarget: target,
      },
      { next: true },
    )
    expect(getFxDebugLog()).toHaveLength(0)

    setFxDebugEnabled(true)
    tapDebug(
      'reveal-click',
      {
        type: 'click',
        clientX: 10,
        clientY: 20,
        target,
        currentTarget: target,
      },
      { next: true },
    )
    expect(getFxDebugLog()[0]?.message).toBe('tap:reveal-click')
    expect(JSON.stringify(getFxDebugLog()[0]?.details)).toContain('Show Sosnovo')
  })
})
