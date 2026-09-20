import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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

function pullToRefresh(target: EventTarget) {
  const delta = PULL_ARM_SLOP + PULL_THRESHOLD / 0.45 + 10
  dispatchTouch('touchstart', 0, target)
  dispatchTouch('touchmove', delta, target)
  dispatchTouch('touchend', delta, target)
}

describe('usePullToRefresh (#254)', () => {
  it('runs onRefresh and does not reload the shell', async () => {
    const onRefresh = vi.fn().mockResolvedValue('updated')
    const target = document.createElement('div')
    document.body.appendChild(target)
    const { result } = renderHook(() => usePullToRefresh(onRefresh))

    act(() => {
      pullToRefresh(target)
    })

    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(reloadForUpdate).not.toHaveBeenCalled()
    expect(result.current.isRefreshing).toBe(true)

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false)
    })
    expect(result.current.pullDistance).toBe(0)
    target.remove()
  })

  it('clears the spinner even when onRefresh rejects', async () => {
    const onRefresh = vi.fn().mockRejectedValue(new Error('offline'))
    const target = document.createElement('div')
    document.body.appendChild(target)
    const { result } = renderHook(() => usePullToRefresh(onRefresh))

    act(() => {
      pullToRefresh(target)
    })

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false)
    })
    expect(reloadForUpdate).not.toHaveBeenCalled()
    target.remove()
  })
})
