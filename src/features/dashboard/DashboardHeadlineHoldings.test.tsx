import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderApp, resetAppStores } from '@test/renderApp'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { formatAmount } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { DashboardScreen } from './DashboardScreen'

beforeEach(async () => {
  await resetAppStores()
})

describe('DashboardHeadline holdings', () => {
  it('disables the currency filter in Converted mode', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useFxStore
      .getState()
      .saveManualRates([
        { date: '2026-08-17', base: 'EUR', quote: 'USD', rate: 1.1 },
      ])
    await useAssetStore.getState().saveAsset(
      {
        id: 'eur',
        name: 'Euro cash',
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
        assetId: 'eur',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveAsset(
      {
        id: 'usd',
        name: 'Dollar cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'USD',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'usd',
        date: '2026-08-17',
        amount: 110,
        currency: 'USD',
      },
    )

    renderApp(<DashboardScreen />)

    expect(
      await screen.findAllByText(formatAmount(1100, 'EUR')),
    ).not.toHaveLength(0)
    const currency = screen.getByLabelText('Currency')
    expect(currency).toBeDisabled()
    expect(currency).toHaveValue('EUR')
    expect(
      screen.queryByRole('option', { name: 'All' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Currency filter is inactive/),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Converted with reference exchange rates/),
    ).not.toBeInTheDocument()
    expect(screen.getByText('From amounts')).toBeInTheDocument()
    expect(screen.getByText('From rates')).toBeInTheDocument()
  })

  it('shows every native holding in Original + All', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      currencyDisplayMode: 'native',
    })
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, currencyDisplayMode: 'native' },
      loaded: false,
    })
    await useAssetStore.getState().saveAsset(
      {
        id: 'eur',
        name: 'Euro cash',
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
        assetId: 'eur',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveAsset(
      {
        id: 'rub',
        name: 'Ruble cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'RUB',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'rub',
        date: '2026-08-17',
        amount: 20000,
        currency: 'RUB',
      },
    )

    renderApp(<DashboardScreen />)

    expect(await screen.findByText('Holdings by currency')).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(1000, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByText(
        (_, node) => node?.textContent === formatAmount(20000, 'RUB'),
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Currency')).not.toBeDisabled()
    expect(screen.queryByText('From amounts')).not.toBeInTheDocument()
    expect(screen.queryByTestId('allocation-chart')).not.toBeInTheDocument()
    expect(screen.queryByText('Euro cash')).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'EUR · Holdings' }),
    )
    expect(await screen.findByText('Euro cash')).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'RUB · Holdings' }),
    )
    expect(screen.getByText('Ruble cash')).toBeInTheDocument()
  })

  it('filters Original mode to one native currency', async () => {
    const user = userEvent.setup()
    const now = '2026-08-17T00:00:00.000Z'
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      currencyDisplayMode: 'native',
    })
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, currencyDisplayMode: 'native' },
      loaded: false,
    })
    await useAssetStore.getState().saveAsset(
      {
        id: 'eur',
        name: 'Euro cash',
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
        assetId: 'eur',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveAsset(
      {
        id: 'rub',
        name: 'Ruble cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'RUB',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'rub',
        date: '2026-08-17',
        amount: 20000,
        currency: 'RUB',
      },
    )

    renderApp(<DashboardScreen />)

    expect(await screen.findByText('Holdings by currency')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Currency'), 'EUR')
    expect(
      screen.getAllByText(formatAmount(1000, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(
      screen.queryByText(
        (_, node) => node?.textContent === formatAmount(20000, 'RUB'),
      ),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('allocation-chart')).not.toBeInTheDocument()
  })

  it('lists unconvertible holdings instead of hiding them', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'eur',
        name: 'Euro cash',
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
        assetId: 'eur',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveAsset(
      {
        id: 'rub',
        name: 'Ruble cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'RUB',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'rub',
        date: '2026-08-17',
        amount: 20000,
        currency: 'RUB',
      },
    )

    renderApp(<DashboardScreen />)

    expect(
      await screen.findByRole('button', { name: 'Holdings' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Ruble cash')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Holdings' }))
    expect(await screen.findByText('Ruble cash')).toBeInTheDocument()
    expect(screen.getByText('Conversion not available')).toBeInTheDocument()
    expect(
      screen.getAllByText(
        (_, node) =>
          node?.children.length === 0 &&
          node.textContent === formatAmount(20000, 'RUB'),
      ).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText(formatAmount(1000, 'EUR')).length,
    ).toBeGreaterThan(0)
  })

  it('lists each Converted holding with original and converted amounts', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useFxStore
      .getState()
      .saveManualRates([
        { date: '2026-08-17', base: 'EUR', quote: 'RUB', rate: 100 },
      ])
    await useAssetStore.getState().saveAsset(
      {
        id: 'eur',
        name: 'Euro cash',
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
        assetId: 'eur',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveAsset(
      {
        id: 'rub',
        name: 'Ruble cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'RUB',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'rub',
        date: '2026-08-17',
        amount: 20000,
        currency: 'RUB',
      },
    )

    renderApp(<DashboardScreen />)

    await userEvent.click(
      await screen.findByRole('button', { name: 'Holdings' }),
    )
    expect(await screen.findByText('Ruble cash')).toBeInTheDocument()
    expect(screen.getByText('Euro cash')).toBeInTheDocument()
    expect(
      screen.getAllByText(
        (_, node) =>
          node?.children.length === 0 &&
          node.textContent === formatAmount(20000, 'RUB'),
      ).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText(formatAmount(200, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText(formatAmount(1200, 'EUR')).length,
    ).toBeGreaterThan(0)
  })
})
