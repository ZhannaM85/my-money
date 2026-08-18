import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { lookupRate } from '@/domain/fx'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { todayIsoDate } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { ManualRatesSection } from './ManualRatesSection'

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  await db.fxRates.clear()
  await db.manualFxRates.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: true })
  useFxStore.setState({
    ...useFxStore.getState(),
    quotes: [],
    manualQuotes: [],
    loading: false,
    error: undefined,
  })
  useSettingsStore.setState({
    settings: { ...DEFAULT_SETTINGS, baseCurrency: 'EUR' },
    loaded: true,
  })
})

describe('ManualRatesSection', () => {
  it('saves today’s manual rates and prefers them in the FX store', async () => {
    const user = userEvent.setup()
    const today = todayIsoDate()
    const now = `${today}T00:00:00.000Z`
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
        date: today,
        amount: 20000,
        currency: 'RUB',
      },
    )

    render(<ManualRatesSection />)

    await user.click(
      await screen.findByRole('button', { name: "Edit today's rates" }),
    )
    const input = await screen.findByLabelText('1 EUR = … RUB')
    await user.clear(input)
    await user.type(input, '100')
    await user.click(screen.getByRole('button', { name: "Save today's rates" }))

    expect(
      await screen.findByText(
        'Saved. Converted totals will use these overrides for today.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: "Save today's rates" }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/1 EUR = … RUB/)).toBeInTheDocument()

    const quotes = useFxStore.getState().quotes
    expect(lookupRate(quotes, 'EUR', 'RUB', today)).toBe(100)
    expect(lookupRate(quotes, 'RUB', 'EUR', today)).toBeCloseTo(0.01)
  })
})
