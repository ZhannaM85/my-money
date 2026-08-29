import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { formatAmount } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { ComparisonScreen } from './ComparisonScreen'

beforeEach(async () => {
  vi.restoreAllMocks()
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
  useFxStore.setState({
    ...useFxStore.getState(),
    quotes: [],
    manualQuotes: [],
    loading: false,
    error: undefined,
  })
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
    loaded: true,
  })
  useComparisonStore.setState({ dates: [] })
})

describe('ComparisonScreen (#137)', () => {
  it('shows a table of holdings for selected dates and can remove a day', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'a1',
        name: 'Cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a1',
        date: '2026-08-25',
        amount: 100,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: '2026-08-29',
        amount: 150,
        currency: 'EUR',
      },
    ])
    useComparisonStore.setState({ dates: ['2026-08-25', '2026-08-29'] })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ComparisonScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByTestId('comparison-table')).toBeInTheDocument()
    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(100, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText(formatAmount(150, 'EUR')).length,
    ).toBeGreaterThan(0)
    await user.click(
      screen.getByRole('button', { name: 'Remove 2026-08-25' }),
    )
    expect(useComparisonStore.getState().dates).toEqual(['2026-08-29'])
    expect(
      await screen.findByText('Add at least two dates from Dashboard.'),
    ).toBeInTheDocument()
  })

  it('asks before removing a date; cancel keeps it (#140)', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'a1',
        name: 'Cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a1',
        date: '2026-08-25',
        amount: 100,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: '2026-08-29',
        amount: 150,
        currency: 'EUR',
      },
    ])
    useComparisonStore.setState({ dates: ['2026-08-25', '2026-08-29'] })
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ComparisonScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByTestId('comparison-table')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Remove 2026-08-25' }),
    )
    expect(confirm).toHaveBeenCalledWith('Remove 2026-08-25 from comparison?')
    expect(useComparisonStore.getState().dates).toEqual([
      '2026-08-25',
      '2026-08-29',
    ])
    confirm.mockReturnValue(true)
    await user.click(
      screen.getByRole('button', { name: 'Remove 2026-08-25' }),
    )
    expect(useComparisonStore.getState().dates).toEqual(['2026-08-29'])
  })

  it('asks before removing every date; cancel keeps them (#143)', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'a1',
        name: 'Cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a1',
        date: '2026-08-25',
        amount: 100,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: '2026-08-29',
        amount: 150,
        currency: 'EUR',
      },
    ])
    useComparisonStore.setState({ dates: ['2026-08-25', '2026-08-29'] })
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ComparisonScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByTestId('comparison-table')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Remove all dates' }),
    )
    expect(confirm).toHaveBeenCalledWith(
      'Remove all dates from comparison?',
    )
    expect(useComparisonStore.getState().dates).toEqual([
      '2026-08-25',
      '2026-08-29',
    ])
    confirm.mockReturnValue(true)
    await user.click(
      screen.getByRole('button', { name: 'Remove all dates' }),
    )
    expect(useComparisonStore.getState().dates).toEqual([])
    expect(
      await screen.findByText('Add at least two dates from Dashboard.'),
    ).toBeInTheDocument()
  })

  it('keeps the name column narrow and wrapping so two date columns fit (#138)', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'a1',
        name: 'Дебетовая карта BOG-GEL',
        assetClass: 'money',
        type: 'debit_card',
        currency: 'GEL',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a1',
        date: '2026-08-25',
        amount: 100,
        currency: 'GEL',
      },
    )
    useComparisonStore.setState({ dates: ['2026-08-25', '2026-08-29'] })
    render(
      <MemoryRouter>
        <ComparisonScreen />
      </MemoryRouter>,
    )
    const nameCol = await screen.findByTestId('comparison-name-col')
    expect(nameCol).toHaveClass('w-24')
    expect(nameCol).toHaveClass('max-w-24')
    expect(nameCol).toHaveClass('whitespace-normal')
    expect(nameCol).toHaveClass('break-words')
    const dateHeader = screen.getByRole('columnheader', { name: '25 Aug' })
    expect(dateHeader.className).toContain('min-w-[8.25rem]')
    expect(dateHeader.className).toContain('w-[8.25rem]')
  })

  it('scrolls date columns inside the table, not the page; names stay sticky (#139)', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'a1',
        name: 'Cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a1',
        date: '2026-08-25',
        amount: 100,
        currency: 'EUR',
      },
    )
    useComparisonStore.setState({
      dates: ['2026-08-25', '2026-08-26', '2026-08-28', '2026-08-29'],
    })
    render(
      <MemoryRouter>
        <ComparisonScreen />
      </MemoryRouter>,
    )
    const scroller = await screen.findByTestId('comparison-h-scroll')
    expect(scroller.className).toContain('overflow-x-auto')
    expect(scroller.className).toContain('overflow-y-hidden')
    expect(scroller.className).toContain('comparison-h-scroll')
    expect(scroller.className).toContain('flex-1')
    expect(scroller.className).toContain('min-w-0')
    const nameCol = screen.getByTestId('comparison-name-col')
    expect(scroller.contains(nameCol)).toBe(false)
    expect(nameCol.className).not.toContain('sticky')
    expect(
      screen.getAllByRole('button', { name: /^Remove \d{4}-/ }),
    ).toHaveLength(4)
  })
})
