import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderApp, resetAppStores } from '@test/renderApp'
import type { Asset } from '@/domain/asset'
import {
  formatConvertedWithNativeAmount,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useChartRangeStore } from '@/stores/chartRangeStore'
import { useFxStore } from '@/stores/fxStore'
import { DashboardScreen } from './DashboardScreen'

beforeEach(async () => {
  await resetAppStores()
})

describe('Dashboard period contribution rows (#303)', () => {
  it('appends the native amount on non-base expansion rows only', async () => {
    const user = userEvent.setup()
    const today = todayIsoDate()
    const start = '2026-08-01'
    const now = `${today}T00:00:00.000Z`
    const endUsd = 1500 * 0.9
    const startUsd = 1000 * 0.8
    const endRate = endUsd / 1500
    const startRate = startUsd / 1000
    const usdAmountChange = 500 * endRate
    const usdRateChange = 1000 * (endRate - startRate)
    const usdNativeRateChange = usdRateChange / endRate

    await useFxStore.getState().saveManualRates([
      { date: start, base: 'USD', quote: 'EUR', rate: 0.8 },
      { date: today, base: 'USD', quote: 'EUR', rate: 0.9 },
    ])

    const euro: Asset = {
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
    }
    const dollar: Asset = {
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
    }
    await useAssetStore.getState().saveAsset(euro, {
      assetId: 'eur',
      date: start,
      amount: 1000,
      currency: 'EUR',
    })
    await useAssetStore.getState().saveAsset(euro, {
      assetId: 'eur',
      date: today,
      amount: 1100,
      currency: 'EUR',
    })
    await useAssetStore.getState().saveAsset(dollar, {
      assetId: 'usd',
      date: start,
      amount: 1000,
      currency: 'USD',
    })
    await useAssetStore.getState().saveAsset(dollar, {
      assetId: 'usd',
      date: today,
      amount: 1500,
      currency: 'USD',
    })
    useChartRangeStore.setState({ range: 'All' })

    renderApp(<DashboardScreen />)

    const amountButton = await screen.findByRole('button', {
      name: /From amounts/,
    })
    expect(amountButton).toHaveTextContent(
      formatSignedAmount(100 + usdAmountChange, 'EUR'),
    )
    expect(amountButton).not.toHaveTextContent('USD')
    await user.click(amountButton)

    const amountItem = amountButton.closest('li')
    expect(amountItem).toBeTruthy()
    const amountScope = within(amountItem as HTMLElement)
    expect(amountScope.getByText('Euro cash').parentElement).toHaveTextContent(
      formatSignedAmount(100, 'EUR'),
    )
    expect(
      amountScope.getByText('Euro cash').parentElement?.textContent,
    ).not.toMatch(/[()]/)
    expect(
      amountScope.getByText('Dollar cash').parentElement,
    ).toHaveTextContent(
      formatConvertedWithNativeAmount(usdAmountChange, 'EUR', 500, 'USD'),
    )

    const rateButton = screen.getByRole('button', { name: /From rates/ })
    expect(rateButton).toHaveTextContent(
      formatSignedAmount(usdRateChange, 'EUR'),
    )
    expect(rateButton).not.toHaveTextContent('USD')
    await user.click(rateButton)
    const rateItem = rateButton.closest('li')
    expect(rateItem).toBeTruthy()
    const rateScope = within(rateItem as HTMLElement)
    expect(rateScope.queryByText('Euro cash')).not.toBeInTheDocument()
    expect(rateScope.getByText('Dollar cash').parentElement).toHaveTextContent(
      formatConvertedWithNativeAmount(
        usdRateChange,
        'EUR',
        usdNativeRateChange,
        'USD',
      ),
    )
  })
})
