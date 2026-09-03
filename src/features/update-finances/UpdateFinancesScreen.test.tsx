import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/infrastructure/persistence/indexeddb'
import { addDaysIso } from '@/shared/lib/dates'
import { todayIsoDate } from '@/shared/lib/money'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { UpdateFinancesScreen } from './UpdateFinancesScreen'

const now = '2026-08-01T00:00:00.000Z'

function setDateField(input: HTMLElement, value: string) {
  input.focus()
  Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  )?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
    loaded: true,
  })
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
      date: '2026-08-01',
      amount: 1000,
      currency: 'EUR',
    },
  )
})

describe('UpdateFinancesScreen', () => {
  it('saves only filled rows and skips empty ones (#200)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveAsset(
      {
        id: 'a2',
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
        assetId: 'a2',
        date: '2026-08-01',
        amount: 200,
        currency: 'EUR',
      },
    )
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const revolut = await screen.findByLabelText('Revolut new amount')
    await user.type(revolut, '1500')
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.filter((row) => row.assetId === 'a1' && row.date === todayIsoDate()),
      ).toHaveLength(1)
    })
    expect(
      useAssetStore
        .getState()
        .snapshots.filter((row) => row.assetId === 'a2' && row.date === todayIsoDate()),
    ).toHaveLength(0)
    expect(screen.queryByText(/Mark no change/)).not.toBeInTheDocument()
  })

  it('does not write when every amount is empty (#200)', async () => {
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await screen.findByLabelText('Revolut new amount')
    expect(screen.getByRole('button', { name: 'Save updates' })).toBeDisabled()
    expect(
      useAssetStore.getState().snapshots.filter((row) => row.assetId === 'a1'),
    ).toHaveLength(1)
  })

  it('enables Save only after an amount is typed (#204)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const input = await screen.findByLabelText('Revolut new amount')
    const save = screen.getByRole('button', { name: 'Save updates' })
    expect(save).toBeDisabled()
    await user.type(input, '1500')
    expect(save).toBeEnabled()
    await user.clear(input)
    expect(save).toBeDisabled()
  })

  it('does not show a No change button (#201)', async () => {
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await screen.findByLabelText('Revolut new amount')
    expect(
      screen.queryByRole('button', { name: 'No change' }),
    ).not.toBeInTheDocument()
  })

  it('defaults As of to today and saves typed amounts on a chosen past date (#175)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveAsset(
      {
        id: 'a2',
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
        assetId: 'a2',
        date: '2026-08-01',
        amount: 200,
        currency: 'EUR',
      },
    )
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const asOf = await screen.findByLabelText('As of')
    expect(asOf).toHaveValue(todayIsoDate())
    const past = addDaysIso(todayIsoDate(), -3)
    setDateField(asOf, past)
    await user.type(await screen.findByLabelText('Revolut new amount'), '1000')
    await user.type(screen.getByLabelText('Cash new amount'), '200')
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.filter((row) => row.date === past),
      ).toHaveLength(2)
    })
    expect(
      useAssetStore
        .getState()
        .snapshots.filter((row) => row.date === todayIsoDate()),
    ).toHaveLength(0)
  })

  it('rejects a future As of date (#175)', async () => {
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const asOf = await screen.findByLabelText('As of')
    setDateField(asOf, addDaysIso(todayIsoDate(), 1))
    expect(
      await screen.findByText('Choose today or a past date'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save updates' })).toBeDisabled()
    expect(
      useAssetStore.getState().snapshots.filter((row) => row.assetId === 'a1'),
    ).toHaveLength(1)
  })

  it('shows a locked amount with edit when As of already has a snapshot (#176)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const asOf = await screen.findByLabelText('As of')
    setDateField(asOf, '2026-08-01')
    expect(
      await screen.findByRole('button', { name: 'Edit Revolut' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('Revolut new amount'),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Edit Revolut' }))
    const input = await screen.findByLabelText('Revolut new amount')
    await user.clear(input)
    await user.type(input, '1500')
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    await waitFor(() => {
      expect(useAssetStore.getState().snapshots[0]?.amount).toBe(1500)
    })
    expect(useAssetStore.getState().snapshots).toHaveLength(1)
    expect(useAssetStore.getState().snapshots[0]?.date).toBe('2026-08-01')
  })

  it('stays on Update in view mode after Save (#181)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const input = await screen.findByLabelText('Revolut new amount')
    await user.type(input, '1000')
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    expect(
      await screen.findByRole('button', { name: 'Edit Revolut' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Update' })).toBeInTheDocument()
    expect(screen.getByLabelText('As of')).toHaveValue(todayIsoDate())
    expect(
      screen.queryByRole('button', { name: 'No change' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('Revolut new amount'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('update-delta-a1')).not.toBeInTheDocument()
  })

  it('renders the hint full width below the title, not beside the date (#178)', async () => {
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const hint = await screen.findByTestId('update-description')
    const title = screen.getByRole('heading', { name: 'Update' })
    expect(hint.parentElement).not.toBe(title.parentElement)
    expect(hint).toHaveTextContent(/Previous amounts/)
    expect(screen.getByLabelText('As of')).toBeInTheDocument()
  })

  it('hides the reorder icon when there is only one holding (#179)', async () => {
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await screen.findByLabelText('Revolut new amount')
    expect(
      screen.queryByRole('button', { name: 'Reorder' }),
    ).not.toBeInTheDocument()
  })

  it('toggles reorder mode on the same icon and saves custom order (#179)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveAsset(
      {
        id: 'a2',
        name: 'Cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'yearly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a2',
        date: '2026-08-01',
        amount: 200,
        currency: 'EUR',
      },
    )
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: 'Reorder' }))
    expect(
      await screen.findByRole('button', { name: 'Save order' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reorder Revolut' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reorder Cash' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Save updates' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('Revolut new amount'),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save order' }))
    await waitFor(() => {
      expect(useSettingsStore.getState().settings.assetListSort).toBe('custom')
    })
    expect(
      screen.queryByRole('button', { name: 'Reorder Revolut' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reorder' }),
    ).toBeInTheDocument()
  })

  it('shows a Save icon on the reorder toggle while reordering (#183)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveAsset(
      {
        id: 'a2',
        name: 'Cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'yearly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a2',
        date: '2026-08-01',
        amount: 200,
        currency: 'EUR',
      },
    )
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const enter = await screen.findByRole('button', { name: 'Reorder' })
    expect(enter.querySelector('.lucide-list-ordered')).toBeTruthy()
    await user.click(enter)
    const save = await screen.findByRole('button', { name: 'Save order' })
    expect(save.querySelector('.lucide-save')).toBeTruthy()
    expect(save.querySelector('.lucide-list-ordered')).toBeFalsy()
    await user.click(save)
    expect(
      (await screen.findByRole('button', { name: 'Reorder' })).querySelector(
        '.lucide-list-ordered',
      ),
    ).toBeTruthy()
  })

  it('shows institution under the holding title when set (#184)', async () => {
    await useAssetStore.getState().saveAsset({
      id: 'a1',
      name: 'Revolut',
      assetClass: 'money',
      type: 'bank',
      currency: 'EUR',
      trackingStatus: 'included',
      valuationMethod: 'account_balance',
      updateFrequency: 'weekly',
      institution: 'BOG',
      createdAt: now,
      updatedAt: now,
    })
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await screen.findByText('Revolut')
    expect(screen.getByText('BOG')).toBeInTheDocument()
    expect(screen.getByText(/Updated/)).toBeInTheDocument()
  })

  it('follows the Assets custom order and keeps Suggested now as a badge (#179)', async () => {
    await useAssetStore.getState().saveAsset(
      {
        id: 'a2',
        name: 'Cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'yearly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a2',
        date: '2026-08-01',
        amount: 200,
        currency: 'EUR',
      },
    )
    await useSettingsStore.getState().persistCustomAssetOrder(['a2', 'a1'])
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await screen.findByText('Cash')
    const list = screen.getByRole('list')
    expect(list.textContent!.indexOf('Cash')).toBeLessThan(
      list.textContent!.indexOf('Revolut'),
    )
    expect(screen.getByText(/Suggested now/)).toBeInTheDocument()
  })

  it('pre-fills from the snapshot before As of, not a later latest (#180)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: todayIsoDate(),
        amount: 9999,
        currency: 'EUR',
      },
    ])
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const asOf = await screen.findByLabelText('As of')
    const past = addDaysIso(todayIsoDate(), -3)
    setDateField(asOf, past)
    const input = await screen.findByLabelText('Revolut new amount')
    expect(input).toHaveAttribute('placeholder', '1,000.00')
    expect(screen.getByTestId('suggested-from-date-a1')).toHaveTextContent(
      'From 1 Aug 2026',
    )
    await user.type(input, '1000')
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.find((row) => row.assetId === 'a1' && row.date === past)
          ?.amount,
      ).toBe(1000)
    })
  })

  it('shows the calendar date the suggested amount comes from (#192)', async () => {
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: todayIsoDate(),
        amount: 9999,
        currency: 'EUR',
      },
    ])
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const asOf = await screen.findByLabelText('As of')
    setDateField(asOf, addDaysIso(todayIsoDate(), -3))
    const hint = await screen.findByTestId('suggested-from-date-a1')
    expect(hint).toHaveTextContent('From 1 Aug 2026')
  })

  it('pins As of outside the scrolling holdings list (#191)', async () => {
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const asOf = await screen.findByLabelText('As of')
    const bar = screen.getByTestId('update-as-of-bar')
    const scroll = screen.getByTestId('update-holdings-scroll')
    expect(bar).toContainElement(asOf)
    expect(bar.className).toMatch(/shrink-0/)
    expect(scroll.className).toMatch(/overflow-y-auto/)
    expect(scroll).not.toContainElement(asOf)
    expect(scroll).toContainElement(screen.getByTestId('update-description'))
    const save = screen.getByRole('button', { name: 'Save updates' })
    const saveBar = screen.getByTestId('update-save-bar')
    expect(saveBar).toContainElement(save)
    expect(saveBar.className).toMatch(/shrink-0/)
    expect(scroll).not.toContainElement(save)
    expect(scroll.className).toMatch(/overscroll-y-contain/)
    expect(scroll.className).toMatch(/touch-pan-y/)
  })

  it('keeps Save updates pinned below the holdings scroller (#203)', async () => {
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const scroll = await screen.findByTestId('update-holdings-scroll')
    const save = screen.getByRole('button', { name: 'Save updates' })
    expect(screen.getByTestId('update-save-bar')).toContainElement(save)
    expect(scroll).not.toContainElement(save)
  })

  it('shows a Comparison-style delta vs the previous snapshot after save (#193)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const input = await screen.findByLabelText('Revolut new amount')
    await user.type(input, '1500')
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    const delta = await screen.findByTestId('update-delta-a1')
    expect(delta).toHaveTextContent('vs 1 Aug 2026')
    const arrow = screen.getByTestId('comparison-delta')
    expect(arrow).toHaveAttribute('data-direction', 'up')
    expect(arrow).toHaveClass('text-[var(--chart-investments)]')
    expect(arrow).toHaveTextContent('+')
  })

  it('shows a red down delta when the saved amount is lower (#193)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const input = await screen.findByLabelText('Revolut new amount')
    await user.type(input, '400')
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    const arrow = await screen.findByTestId('comparison-delta')
    expect(arrow).toHaveAttribute('data-direction', 'down')
    expect(arrow).toHaveClass('text-destructive')
  })

  it('shows live green/red delta while typing (#206)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const input = await screen.findByLabelText('Revolut new amount')
    await user.type(input, '1500')
    const delta = await screen.findByTestId('update-edit-delta-a1')
    expect(delta).toHaveTextContent('vs 1 Aug 2026')
    const arrow = delta.querySelector('[data-testid="comparison-delta"]')
    expect(arrow).toHaveAttribute('data-direction', 'up')
    expect(arrow).toHaveClass('text-[var(--chart-investments)]')
  })

  it('lists excluded holdings so a new amount can be saved (#202)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveAsset(
      {
        id: 'house',
        name: 'Sosnovo',
        assetClass: 'property',
        type: 'house',
        currency: 'EUR',
        trackingStatus: 'excluded',
        valuationMethod: 'market_price',
        updateFrequency: 'yearly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'house',
        date: '2026-08-01',
        amount: 200_000,
        currency: 'EUR',
      },
    )
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Sosnovo')).toBeInTheDocument()
    expect(screen.getByText('Not counted in net worth')).toBeInTheDocument()
    const input = screen.getByLabelText('Sosnovo new amount')
    await user.type(input, '250000')
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.find(
            (row) => row.assetId === 'house' && row.date === todayIsoDate(),
          )?.amount,
      ).toBe(250_000)
    })
    expect(
      useAssetStore.getState().assets.find((row) => row.id === 'house')
        ?.trackingStatus,
    ).toBe('excluded')
  })

  it('omits archived holdings from Update (#202)', async () => {
    await useAssetStore.getState().saveAsset(
      {
        id: 'old',
        name: 'Archived cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'EUR',
        trackingStatus: 'archived',
        valuationMethod: 'account_balance',
        updateFrequency: 'manual',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'old',
        date: '2026-08-01',
        amount: 50,
        currency: 'EUR',
      },
    )
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await screen.findByLabelText('Revolut new amount')
    expect(screen.queryByText('Archived cash')).not.toBeInTheDocument()
  })
})
