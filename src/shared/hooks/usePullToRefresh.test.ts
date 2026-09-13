import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useFxStore } from '@/stores/fxStore'
import { PULL_ARM_SLOP, PULL_THRESHOLD } from '@/shared/lib/pullToRefresh'
import { usePullToRefresh } from './usePullToRefresh'

const reloadForUpdate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('@/shared/lib/reloadForUpdate', () => ({
  reloadForUpdate,
}))

function dispatchTouch(
  type: 'touchstart' | 'touchmove' | 'touchend',
  clientY: number,
  target: EventTarget,
) {
  const touch = { clientY, target, identifier: 0 }
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'touches', {
    value: type === 'touchend' ? [] : [touch],
  })
  Object.defineProperty(event, 'target', { value: target })
  document.dispatchEvent(event)
}

describe('usePullToRefresh (#254)', () => {
  afterEach(() => {
    reloadForUpdate.mockClear()
  })

  it('reloads the app and does not fetch FX rates', () => {
    const ensureRange = vi.spyOn(useFxStore.getState(), 'ensureRange')
    const target = document.createElement('div')
    document.body.appendChild(target)
    renderHook(() => usePullToRefresh())

    const delta = PULL_ARM_SLOP + PULL_THRESHOLD / 0.45 + 10
    act(() => {
      dispatchTouch('touchstart', 0, target)
      dispatchTouch('touchmove', delta, target)
      dispatchTouch('touchend', delta, target)
    })

    expect(reloadForUpdate).toHaveBeenCalledTimes(1)
    expect(ensureRange).not.toHaveBeenCalled()
    target.remove()
    ensureRange.mockRestore()
  })
})
