import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { formatDateTime } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { FX_LAST_FETCHED_KEY, useFxStore } from '@/stores/fxStore'
import { DashboardScreen } from './DashboardScreen'
import { resetDashboardStores } from './dashboardTestSetup'

beforeEach(async () => {
  await resetDashboardStores()
})

describe('DashboardRates', () => {
  it('forces a quote refresh and reports the result (#186)', async () => {
    const user = userEvent.setup()
    const originalEnsureRange = useFxStore.getState().ensureRange
    const ensureRange = vi.fn(async () => {})
    useFxStore.setState({ ensureRange })
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'a1',
        name: 'Revolut',
        assetClass: 'money',
        type: 'bank',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a1',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    try {
      render(
        <MemoryRouter>
          <DashboardScreen />
        </MemoryRouter>,
      )
      const button = await screen.findByRole('button', { name: 'Update rates' })
      await user.click(button)
      expect(ensureRange).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'EUR',
        expect.any(Array),
        { force: true },
      )
      expect(await screen.findByRole('status')).toHaveTextContent(
        'Rates updated',
      )
    } finally {
      useFxStore.setState({ ensureRange: originalEnsureRange })
    }
  })

  it('explains when Update rates cannot fetch because the device is offline (#186)', async () => {
    const user = userEvent.setup()
    const originalEnsureRange = useFxStore.getState().ensureRange
    const ensureRange = vi.fn(async () => {})
    useFxStore.setState({ ensureRange })
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'a1',
        name: 'Revolut',
        assetClass: 'money',
        type: 'bank',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a1',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    try {
      render(
        <MemoryRouter>
          <DashboardScreen />
        </MemoryRouter>,
      )
      await user.click(
        await screen.findByRole('button', { name: 'Update rates' }),
      )
      expect(await screen.findByRole('status')).toHaveTextContent(
        'Offline — using saved rates',
      )
    } finally {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: true,
      })
      useFxStore.setState({ ensureRange: originalEnsureRange })
    }
  })

  it('makes Update rates a large full-width control and shows last-updated time (#188)', async () => {
    const user = userEvent.setup()
    const originalEnsureRange = useFxStore.getState().ensureRange
    const ensureRange = vi.fn(async () => {})
    useFxStore.setState({ ensureRange })
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'a1',
        name: 'Revolut',
        assetClass: 'money',
        type: 'bank',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a1',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    try {
      render(
        <MemoryRouter>
          <DashboardScreen />
        </MemoryRouter>,
      )
      const button = await screen.findByRole('button', { name: 'Update rates' })
      expect(button.className).toMatch(/\bh-control\b/)
      expect(button.className).toMatch(/\bw-full\b/)
      await user.click(button)
      const fetched = useFxStore.getState().lastFetchedAt
      expect(fetched).toBeTruthy()
      const status = await screen.findByRole('status')
      expect(status).toHaveTextContent('Rates updated')
      expect(status).toHaveTextContent(formatDateTime(fetched!, 'en'))
    } finally {
      useFxStore.setState({ ensureRange: originalEnsureRange })
    }
  })

  it('keeps the last rate-fetch time after leaving Dashboard (#188)', async () => {
    const stamp = '2026-09-01T11:29:00.000Z'
    localStorage.setItem(FX_LAST_FETCHED_KEY, stamp)
    useFxStore.setState({ lastFetchedAt: stamp })
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'a1',
        name: 'Revolut',
        assetClass: 'money',
        type: 'bank',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a1',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    const { unmount } = render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('status')).toHaveTextContent(
      formatDateTime(stamp, 'en'),
    )
    unmount()
    useFxStore.setState({ lastFetchedAt: undefined })
    await useFxStore.getState().loadCached()
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('status')).toHaveTextContent(
      formatDateTime(stamp, 'en'),
    )
  })
})
