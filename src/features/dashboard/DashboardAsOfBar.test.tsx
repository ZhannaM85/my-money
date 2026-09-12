import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { formatAmount, todayIsoDate } from '@/shared/lib/money'
import { addDaysIso } from '@/shared/lib/dates'
import { useAssetStore } from '@/stores/assetStore'
import { DashboardScreen } from './DashboardScreen'
import { resetDashboardStores } from './dashboardTestSetup'

beforeEach(async () => {
  await resetDashboardStores()
})

describe('DashboardAsOfBar', () => {
  it('drives Positions from the As of date field (#117)', async () => {
    const today = todayIsoDate()
    const past = addDaysIso(today, -20)
    const now = `${today}T00:00:00.000Z`
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
        date: past,
        amount: 500,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: today,
        amount: 900,
        currency: 'EUR',
      },
    ])
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Net worth')).toBeInTheDocument()
    const asOf = screen.getByLabelText('As of')
    asOf.focus()
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set?.call(asOf, past)
    asOf.dispatchEvent(new Event('input', { bubbles: true }))
    asOf.dispatchEvent(new Event('change', { bubbles: true }))
    expect(
      await screen.findByRole('button', { name: `Holdings on ${past}` }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(500, 'EUR')).length,
    ).toBeGreaterThan(0)
  })

  it('shows Positions total for the selected As of date (#124)', async () => {
    const today = todayIsoDate()
    const past = addDaysIso(today, -20)
    const now = `${today}T00:00:00.000Z`
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
        date: past,
        amount: 500,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: today,
        amount: 900,
        currency: 'EUR',
      },
    ])
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Net worth')).toBeInTheDocument()
    const asOf = screen.getByLabelText('As of')
    asOf.focus()
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set?.call(asOf, past)
    asOf.dispatchEvent(new Event('input', { bubbles: true }))
    asOf.dispatchEvent(new Event('change', { bubbles: true }))
    expect(
      await screen.findByRole('button', { name: `Holdings on ${past}` }),
    ).toBeInTheDocument()
    const total = await screen.findByTestId('positions-total')
    expect(total).toHaveTextContent('Total')
    expect(total).toHaveTextContent(formatAmount(500, 'EUR'))
  })

  it('shows a Today button next to As of that jumps back to today (#125)', async () => {
    const user = userEvent.setup()
    const today = todayIsoDate()
    const past = addDaysIso(today, -20)
    const now = `${today}T00:00:00.000Z`
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
        date: past,
        amount: 500,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: today,
        amount: 900,
        currency: 'EUR',
      },
    ])
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Net worth')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Today' }),
    ).not.toBeInTheDocument()
    const asOf = screen.getByLabelText('As of')
    asOf.focus()
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set?.call(asOf, past)
    asOf.dispatchEvent(new Event('input', { bubbles: true }))
    asOf.dispatchEvent(new Event('change', { bubbles: true }))
    expect(
      await screen.findByRole('button', { name: `Holdings on ${past}` }),
    ).toBeInTheDocument()
    const todayButton = screen.getByRole('button', { name: 'Today' })
    expect(todayButton.parentElement?.className).toContain('flex-nowrap')
    expect(todayButton.className).toContain('px-1.5')
    expect(todayButton.className).toContain('h-control')
    expect(todayButton.className).toContain('text-base')
    await user.click(todayButton)
    expect(
      await screen.findByRole('button', { name: 'Holdings' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Today' }),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText('As of')).toHaveValue(today)
  })

  it('scrolls the title away while keeping As of sticky (#207, #212)', async () => {
    const today = todayIsoDate()
    const now = `${today}T00:00:00.000Z`
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
        date: today,
        amount: 1000,
        currency: 'EUR',
      },
    )
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    const bar = await screen.findByTestId('dashboard-as-of-bar')
    const scroll = screen.getByTestId('dashboard-scroll')
    const asOf = screen.getByLabelText('As of')
    expect(bar).toContainElement(asOf)
    expect(scroll).toContainElement(
      screen.getByRole('heading', { name: 'Dashboard' }),
    )
    expect(scroll).toContainElement(asOf)
    expect(bar.className).toContain('sticky')
    expect(bar.className).toContain('top-0')
    // #214: scroll on AppShell `#main-content` only — nested overflow split the
    // iOS scrollbar. Sticky As of still sticks to that single scrollport.
    expect(scroll.className).not.toContain('overflow-y-auto')
    expect(scroll.className).toContain('min-w-0')
    // #217: As of stacks above the scrolling body; full-bleed sticky so content
    // cannot show in a gap under the app header (#main-content has no py).
    expect(bar.className).toContain('z-30')
    expect(bar.className).toContain('isolate')
    expect(bar.className).toContain('-mx-4')
    const body = screen.getByTestId('dashboard-scroll-body')
    expect(body.className).toContain('relative')
    expect(body.className).toContain('z-0')
    expect(scroll).toContainElement(body)
  })

  it('adds As of dates to comparison and shows a banner after two (#137)', async () => {
    const today = todayIsoDate()
    const past = addDaysIso(today, -4)
    const now = `${today}T00:00:00.000Z`
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
        date: past,
        amount: 500,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: today,
        amount: 900,
        currency: 'EUR',
      },
    ])
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Net worth')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Go to comparison' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add to comparison' }))
    expect(
      screen.queryByRole('link', { name: 'Go to comparison' }),
    ).not.toBeInTheDocument()
    const asOf = screen.getByLabelText('As of')
    asOf.focus()
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set?.call(asOf, past)
    asOf.dispatchEvent(new Event('input', { bubbles: true }))
    asOf.dispatchEvent(new Event('change', { bubbles: true }))
    await user.click(screen.getByRole('button', { name: 'Add to comparison' }))
    expect(
      screen.getByRole('link', { name: 'Go to comparison' }),
    ).toHaveAttribute('href', '/compare')
  })

  it('replaces the chart with a warning when As of is before any snapshot (#145)', async () => {
    const today = todayIsoDate()
    const firstSnapshot = addDaysIso(today, -10)
    const beforeAny = addDaysIso(firstSnapshot, -5)
    const now = `${today}T00:00:00.000Z`
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
        date: firstSnapshot,
        amount: 900,
        currency: 'EUR',
      },
    )
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByTestId('net-worth-chart')).toBeInTheDocument()
    const asOf = screen.getByLabelText('As of')
    asOf.focus()
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set?.call(asOf, beforeAny)
    asOf.dispatchEvent(new Event('input', { bubbles: true }))
    asOf.dispatchEvent(new Event('change', { bubbles: true }))
    expect(screen.queryByTestId('net-worth-chart')).not.toBeInTheDocument()
    expect(screen.getByText('No holdings on this date')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Nothing was logged on or before this day. Pick a later As of date, or jump to today.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Chart range' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('As of')).toHaveValue(beforeAny)
    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(await screen.findByTestId('net-worth-chart')).toBeInTheDocument()
    expect(
      screen.queryByText('No holdings on this date'),
    ).not.toBeInTheDocument()
  })
})
