import { act, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { PULL_ARM_SLOP, PULL_THRESHOLD } from '@/shared/lib/pullToRefresh'
import { todayIsoDate } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { PullToRefreshIndicator } from './PullToRefreshIndicator'

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

describe('PullToRefreshIndicator (#254)', () => {
  const originalEnsureRange = useFxStore.getState().ensureRange
  const originalMarkRatesFetched = useFxStore.getState().markRatesFetched

  afterEach(() => {
    reloadForUpdate.mockClear()
    useFxStore.setState({
      ensureRange: originalEnsureRange,
      markRatesFetched: originalMarkRatesFetched,
      error: undefined,
    })
  })

  it('force-fetches FX rates instead of reloading the shell', async () => {
    const ensureRange = vi.fn(async () => {})
    const markRatesFetched = vi.fn()
    useFxStore.setState({ ensureRange, markRatesFetched, error: undefined })
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, baseCurrency: 'EUR' },
    })
    useAssetStore.setState({
      snapshots: [
        {
          id: 's1',
          assetId: 'a1',
          date: '2026-01-15',
          amount: 100,
          currency: 'USD',
          createdAt: '2026-01-15T00:00:00.000Z',
        },
      ],
    })

    render(<PullToRefreshIndicator />)
    const target = document.createElement('div')
    document.body.appendChild(target)
    const delta = PULL_ARM_SLOP + PULL_THRESHOLD / 0.45 + 10
    act(() => {
      dispatchTouch('touchstart', 0, target)
      dispatchTouch('touchmove', delta, target)
      dispatchTouch('touchend', delta, target)
    })

    await waitFor(() => {
      expect(ensureRange).toHaveBeenCalledWith(
        '2026-01-15',
        todayIsoDate(),
        'EUR',
        ['USD'],
        { force: true },
      )
    })
    expect(markRatesFetched).toHaveBeenCalledTimes(1)
    expect(reloadForUpdate).not.toHaveBeenCalled()
    target.remove()
  })
})
