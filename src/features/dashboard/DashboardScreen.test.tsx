import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import {
  formatAmount,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import { monthStartIso } from '@/shared/lib/dates'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { DashboardScreen } from './DashboardScreen'

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
    loaded: false,
  })
})

describe('DashboardScreen', () => {
  it('shows calculated net worth from the latest snapshots', async () => {
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
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Net worth')).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(1000, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(screen.getByText('Money')).toBeInTheDocument()
  })

  it('shows this-month change from the month-start snapshot', async () => {
    const today = todayIsoDate()
    const start = monthStartIso(today)
    const now = `${today}T00:00:00.000Z`
    const asset = {
      id: 'a1',
      name: 'Revolut',
      assetClass: 'money' as const,
      type: 'bank' as const,
      currency: 'EUR',
      trackingStatus: 'included' as const,
      valuationMethod: 'account_balance' as const,
      updateFrequency: 'weekly' as const,
      createdAt: now,
      updatedAt: now,
    }
    await useAssetStore.getState().saveAsset(asset, {
      assetId: 'a1',
      date: start,
      amount: 800,
      currency: 'EUR',
    })
    if (start !== today) {
      await useAssetStore.getState().saveAsset(asset, {
        assetId: 'a1',
        date: today,
        amount: 1000,
        currency: 'EUR',
      })
    }
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    const expected =
      start === today
        ? /this month/
        : new RegExp(
            `${formatSignedAmount(200, 'EUR').replaceAll('+', '\\+')}.*this month`,
          )
    expect(await screen.findByText(expected)).toBeInTheDocument()
  })

  it('lets the user zoom the dashboard chart out across wider ranges', async () => {
    const user = userEvent.setup()
    const today = todayIsoDate()
    const now = `${today}T00:00:00.000Z`
    const asset = {
      id: 'a1',
      name: 'Revolut',
      assetClass: 'money' as const,
      type: 'bank' as const,
      currency: 'EUR',
      trackingStatus: 'included' as const,
      valuationMethod: 'account_balance' as const,
      updateFrequency: 'weekly' as const,
      createdAt: now,
      updatedAt: now,
    }
    await useAssetStore.getState().saveAsset(asset, {
      assetId: 'a1',
      date: '2026-01-01',
      amount: 500,
      currency: 'EUR',
    })
    await useAssetStore.getState().saveAsset(asset, {
      assetId: 'a1',
      date: today,
      amount: 1000,
      currency: 'EUR',
    })

    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Chart range: 1M/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Zoom out' }))
    expect(screen.getByText(/Chart range: 3M/)).toBeInTheDocument()
  })
})
