import 'fake-indexeddb/auto'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/infrastructure/persistence/indexeddb'
import { addDaysIso } from '@/shared/lib/dates'
import { formatAmount, todayIsoDate } from '@/shared/lib/money'
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
  await db.settings.put({ ...DEFAULT_SETTINGS, newUpdateUx: true })
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
  useSettingsStore.setState({
    settings: { ...DEFAULT_SETTINGS, newUpdateUx: true },
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
          .snapshots.filter(
            (row) => row.assetId === 'a1' && row.date === todayIsoDate(),
          ),
      ).toHaveLength(1)
    })
    expect(
      useAssetStore
        .getState()
        .snapshots.filter(
          (row) => row.assetId === 'a2' && row.date === todayIsoDate(),
        ),
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
        useAssetStore.getState().snapshots.filter((row) => row.date === past),
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

  it('does not show the grey helper blurb under the title (#238)', async () => {
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    expect(
      await screen.findByRole('heading', { name: 'Update' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('As of')).toBeInTheDocument()
    expect(screen.queryByTestId('update-description')).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Previous amounts, then a new number/),
    ).not.toBeInTheDocument()
  })

  it('keeps empty-state copy when there are no assets (#238)', async () => {
    await db.assets.clear()
    await db.snapshots.clear()
    useAssetStore.setState({ assets: [], snapshots: [], loaded: true })
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Nothing to update')).toBeInTheDocument()
    expect(screen.getByText('Add an asset first.')).toBeInTheDocument()
    expect(screen.queryByTestId('update-description')).not.toBeInTheDocument()
  })

  it('hides the As of title and keeps reorder in the header (#262)', async () => {
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
    const asOf = await screen.findByLabelText('As of')
    expect((asOf as HTMLInputElement).labels?.[0]).toHaveClass('sr-only')
    const bar = screen.getByTestId('update-as-of-bar')
    const reorder = screen.getByRole('button', { name: 'Reorder' })
    expect(bar).toContainElement(asOf)
    expect(bar).toContainElement(reorder)
    expect(screen.getByTestId('update-holdings-scroll')).not.toContainElement(
      reorder,
    )
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
    expect(screen.getByRole('button', { name: 'Reorder' })).toBeInTheDocument()
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
    expect(screen.queryByTestId('update-description')).not.toBeInTheDocument()
    const save = screen.getByRole('button', { name: 'Save updates' })
    const saveBar = screen.getByTestId('update-save-bar')
    expect(saveBar).toContainElement(save)
    expect(saveBar.className).toMatch(/shrink-0/)
    expect(saveBar.className).toMatch(/keyboard-inset-bottom/)
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
    expect(arrow).toHaveClass('text-positive')
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
    expect(arrow).toHaveClass('text-positive')
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

  it('saves an optional per-holding note with a new balance (#275)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveAsset(
      {
        id: 'usd-cash',
        name: 'USD cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'USD',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'manual',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'usd-cash',
        date: '2026-08-01',
        amount: 8000,
        currency: 'USD',
      },
    )
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const amount = await screen.findByLabelText('USD cash new amount')
    const note = screen.getByLabelText('USD cash note')
    expect(note).toHaveAttribute('placeholder', 'Note (optional)')
    await user.type(amount, '5700')
    await user.type(note, '  Spent on travel  ')
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.find(
            (row) => row.assetId === 'usd-cash' && row.date === todayIsoDate(),
          )?.note,
      ).toBe('Spent on travel')
    })
    expect(
      await screen.findByTestId('update-note-saved-usd-cash'),
    ).toHaveTextContent('Spent on travel')
    expect(screen.queryByLabelText('USD cash note')).not.toBeInTheDocument()
  })

  it('saves without a note and does not enable Save from a comment alone (#275)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const amount = await screen.findByLabelText('Revolut new amount')
    const note = screen.getByLabelText('Revolut note')
    const save = screen.getByRole('button', { name: 'Save updates' })
    await user.type(note, 'Forgot the amount')
    expect(save).toBeDisabled()
    await user.clear(note)
    await user.type(amount, '1500')
    expect(save).toBeEnabled()
    await user.click(save)
    await waitFor(() => {
      const saved = useAssetStore
        .getState()
        .snapshots.find(
          (row) => row.assetId === 'a1' && row.date === todayIsoDate(),
        )
      expect(saved?.amount).toBe(1500)
      expect(saved?.note).toBeUndefined()
    })
  })

  it('drops a whitespace-only note when editing a locked amount (#275)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const asOf = await screen.findByLabelText('As of')
    setDateField(asOf, '2026-08-01')
    await user.click(
      await screen.findByRole('button', { name: 'Edit Revolut' }),
    )
    const note = await screen.findByLabelText('Revolut note')
    await user.type(note, '   ')
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    await waitFor(() => {
      expect(useAssetStore.getState().snapshots[0]?.amount).toBe(1000)
    })
    expect(useAssetStore.getState().snapshots[0]?.note).toBeUndefined()
  })

  it('saves the typed remaining as an absolute balance (#292)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await screen.findByLabelText('Revolut new amount')
    expect(
      screen.queryByTestId('balance-entry-toggles'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'New balance' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Removed' }),
    ).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('Revolut new amount'), '770')
    await user.type(screen.getByLabelText('Revolut note'), 'Gifted')
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.some(
            (row) =>
              row.assetId === 'a1' &&
              row.date === todayIsoDate() &&
              row.amount === 770 &&
              row.note === 'Gifted',
          ),
      ).toBe(true)
    })
  })

  it('toggles the holding headline to cumulative given/spent (#276)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: todayIsoDate(),
        amount: 700,
        currency: 'EUR',
      },
    ])
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await screen.findByText('Revolut')
    expect(screen.getByTestId('update-card-preview-a1')).toHaveTextContent(
      formatAmount(700, 'EUR', 'en'),
    )
    await user.click(
      screen.getAllByRole('button', { name: 'Given / received' })[0]!,
    )
    await waitFor(() => {
      expect(useAssetStore.getState().assets[0]?.balanceHeadline).toBe(
        'given_spent',
      )
    })
    expect(screen.getByTestId('update-card-preview-a1')).toHaveTextContent(
      formatAmount(700, 'EUR', 'en'),
    )
  })

  it('keeps the Update card preview on remaining in Given / received (#293)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveAsset(
      {
        id: 'usd-deposit',
        name: 'USD Deposit',
        assetClass: 'money',
        type: 'deposit',
        currency: 'USD',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'manual',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'usd-deposit',
        date: '2026-08-01',
        amount: 12000,
        currency: 'USD',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'usd-deposit',
        date: '2026-08-15',
        amount: 8000,
        currency: 'USD',
        flow: 6056.76,
      },
      {
        assetId: 'usd-deposit',
        date: todayIsoDate(),
        amount: 8000,
        currency: 'USD',
      },
    ])
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const card = (await screen.findByText('USD Deposit')).closest('li')
    expect(card).toBeTruthy()
    const preview = within(card!).getByTestId('update-card-preview-usd-deposit')
    const remaining = formatAmount(8000, 'USD', 'en')
    const givenHeadline = formatAmount(-6056.76, 'USD', 'en')
    expect(preview).toHaveTextContent(remaining)
    await user.click(
      within(card!).getByRole('button', { name: 'Given / received' }),
    )
    await waitFor(() => {
      expect(
        useAssetStore.getState().assets.find((row) => row.id === 'usd-deposit')
          ?.balanceHeadline,
      ).toBe('given_spent')
    })
    expect(preview).toHaveTextContent(remaining)
    expect(preview).not.toHaveTextContent(givenHeadline)
    expect(within(card!).getByLabelText('USD Deposit entry 1')).toHaveValue('')
    await user.click(within(card!).getByRole('button', { name: 'Remaining' }))
    await waitFor(() => {
      expect(
        useAssetStore.getState().assets.find((row) => row.id === 'usd-deposit')
          ?.balanceHeadline,
      ).not.toBe('given_spent')
    })
    expect(preview).toHaveTextContent(remaining)
  })

  it('saves multiple same-day spend lines as separate remaining snapshots (#279)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveAsset(
      {
        id: 'usd-cash',
        name: 'USD cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'USD',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'manual',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'usd-cash',
        date: '2026-08-01',
        amount: 8000,
        currency: 'USD',
      },
    )
    await useAssetStore.getState().setBalanceHeadline('usd-cash', 'given_spent')
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await screen.findByLabelText('USD cash entry 1')
    const save = screen.getByRole('button', { name: 'Save updates' })
    await user.type(screen.getByLabelText('USD cash entry 1 note'), 'Gift')
    expect(save).toBeDisabled()
    await user.type(screen.getByLabelText('USD cash entry 1'), '1000')
    await user.click(screen.getByRole('button', { name: 'Add entry' }))
    await user.type(screen.getByLabelText('USD cash entry 2'), '2000')
    await user.type(screen.getByLabelText('USD cash entry 2 note'), 'Travel')
    expect(screen.getByTestId('resulting-remaining')).toHaveTextContent(/5,000/)
    await user.click(save)
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.filter(
            (row) => row.assetId === 'usd-cash' && row.date === todayIsoDate(),
          )
          .slice()
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map((row) => ({
            amount: row.amount,
            note: row.note,
            flow: row.flow,
          })),
      ).toEqual([
        { amount: 7000, note: 'Gift', flow: -1000 },
        { amount: 5000, note: 'Travel', flow: -2000 },
      ])
    })
    expect(await screen.findByTestId('spend-line-note-0')).toHaveTextContent(
      'Gift',
    )
    expect(screen.getByTestId('spend-line-note-1')).toHaveTextContent('Travel')
    expect(screen.getByTestId('spend-line-amount-0')).toHaveTextContent(
      formatAmount(1000, 'USD', 'en'),
    )
    expect(screen.queryByLabelText('USD cash entry 1')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save updates' })).toBeDisabled()
  })

  it('edits and removes a saved same-day spend line (#280)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveAsset(
      {
        id: 'usd-cash',
        name: 'USD cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'USD',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'manual',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'usd-cash',
        date: '2026-08-01',
        amount: 8000,
        currency: 'USD',
      },
    )
    const today = todayIsoDate()
    await useAssetStore.getState().saveSnapshots([
      {
        id: 's-gift',
        assetId: 'usd-cash',
        date: today,
        amount: 6500,
        currency: 'USD',
        createdAt: `${today}T10:00:00.000Z`,
        note: 'Anton',
      },
      {
        id: 's-card',
        assetId: 'usd-cash',
        date: today,
        amount: 5700,
        currency: 'USD',
        createdAt: `${today}T11:00:00.000Z`,
        note: 'Card',
      },
    ])
    await useAssetStore.getState().setBalanceHeadline('usd-cash', 'given_spent')
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByTestId('spend-line-note-0')).toHaveTextContent(
      'Anton',
    )
    expect(screen.getByTestId('spend-line-amount-0')).toHaveTextContent(
      formatAmount(1500, 'USD', 'en'),
    )
    await user.click(screen.getByRole('button', { name: 'Edit entry 1' }))
    const giftAmount = await screen.findByLabelText('USD cash entry 1')
    expect(giftAmount).toHaveValue('1,500.00')
    expect(screen.getByLabelText('USD cash entry 1 note')).toHaveValue('Anton')
    await user.clear(giftAmount)
    await user.type(giftAmount, '1200')
    await user.click(screen.getByRole('button', { name: 'Save entry 1' }))
    await user.click(screen.getByRole('button', { name: 'Remove entry 2' }))
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    await waitFor(() => {
      const rows = useAssetStore
        .getState()
        .snapshots.filter(
          (row) => row.assetId === 'usd-cash' && row.date === today,
        )
      expect(
        rows.map((row) => ({ amount: row.amount, note: row.note })),
      ).toEqual([{ amount: 6800, note: 'Anton' }])
    })
  })

  it('shows only explicit given/received entries, not lifetime drawdowns (#280)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveAsset(
      {
        id: 'usd-cash',
        name: 'USD cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'USD',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'manual',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'usd-cash',
        date: '2025-12-01',
        amount: 15000,
        currency: 'USD',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'usd-cash',
        date: '2026-01-01',
        amount: 1000,
        currency: 'USD',
      },
      {
        assetId: 'usd-cash',
        date: '2026-08-25',
        amount: 8000,
        currency: 'USD',
      },
      {
        assetId: 'usd-cash',
        date: '2026-09-03',
        amount: 8000,
        currency: 'USD',
      },
      {
        assetId: 'usd-cash',
        date: todayIsoDate(),
        amount: 5700,
        currency: 'USD',
        createdAt: `${todayIsoDate()}T10:00:00.000Z`,
        flow: -1500,
      },
      {
        assetId: 'usd-cash',
        date: todayIsoDate(),
        amount: 4900,
        currency: 'USD',
        createdAt: `${todayIsoDate()}T11:00:00.000Z`,
        flow: -800,
      },
    ])
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const usdCard = (await screen.findByText('USD cash')).closest('li')
    expect(usdCard).toBeTruthy()
    await user.click(
      within(usdCard!).getByRole('button', { name: 'Given / received' }),
    )
    await waitFor(() => {
      expect(
        useAssetStore.getState().assets.find((row) => row.id === 'usd-cash')
          ?.balanceHeadline,
      ).toBe('given_spent')
    })
    expect(
      within(usdCard!).getByTestId('update-card-preview-usd-cash'),
    ).toHaveTextContent(formatAmount(4900, 'USD', 'en'))
    expect(
      within(usdCard!).queryByText(formatAmount(2300, 'USD', 'en')),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(formatAmount(16300, 'USD', 'en')),
    ).not.toBeInTheDocument()
  })

  it('persists remaining and comment from field save without Save updates (#284)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await user.type(await screen.findByLabelText('Revolut new amount'), '1500')
    await user.type(screen.getByLabelText('Revolut note'), 'Top-up')
    expect(screen.getByRole('button', { name: 'Save updates' })).toBeEnabled()
    await user.click(
      screen.getByRole('button', { name: 'Save remaining for Revolut' }),
    )
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.find(
            (row) => row.assetId === 'a1' && row.date === todayIsoDate(),
          ),
      ).toMatchObject({ amount: 1500, note: 'Top-up' })
    })
    const stored = await db.snapshots.where('assetId').equals('a1').toArray()
    expect(
      stored.some(
        (row) =>
          row.date === todayIsoDate() &&
          row.amount === 1500 &&
          row.note === 'Top-up',
      ),
    ).toBe(true)
    expect(
      await screen.findByTestId('update-save-status-a1'),
    ).toHaveTextContent('Saved')
    expect(
      screen.getByRole('button', { name: 'Save updates' }),
    ).toBeInTheDocument()
  })

  it('persists a comment-only field save onto the existing As of snapshot (#284)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    setDateField(await screen.findByLabelText('As of'), '2026-08-01')
    await user.click(
      await screen.findByRole('button', { name: 'Edit Revolut' }),
    )
    const note = await screen.findByLabelText('Revolut note')
    await user.clear(note)
    await user.type(note, 'Edited comment')
    await user.click(
      screen.getByRole('button', { name: 'Save remaining for Revolut' }),
    )
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.find(
            (row) => row.assetId === 'a1' && row.date === '2026-08-01',
          )?.note,
      ).toBe('Edited comment')
    })
    const stored = await db.snapshots.where('assetId').equals('a1').toArray()
    expect(
      stored.some(
        (row) => row.date === '2026-08-01' && row.note === 'Edited comment',
      ),
    ).toBe(true)
  })

  it('persists a given/received line from its save control (#284)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().setBalanceHeadline('a1', 'given_spent')
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await user.type(await screen.findByLabelText('Revolut entry 1'), '250')
    await user.type(screen.getByLabelText('Revolut entry 1 note'), 'Gift')
    await user.click(screen.getByRole('button', { name: 'Save entry 1' }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.find(
            (row) =>
              row.assetId === 'a1' &&
              row.date === todayIsoDate() &&
              row.flow === -250 &&
              row.note === 'Gift',
          ),
      ).toBeTruthy()
    })
    expect(
      screen.getByRole('button', { name: 'Save updates' }),
    ).toBeInTheDocument()
  })

  it('does not leak noop next to the remaining comparison delta (#290)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: '2026-07-01',
        amount: 1500,
        currency: 'EUR',
      },
    ])
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    setDateField(await screen.findByLabelText('As of'), '2026-08-01')
    await user.click(
      await screen.findByRole('button', { name: 'Edit Revolut' }),
    )
    expect(
      await screen.findByTestId('update-edit-delta-a1'),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Save remaining for Revolut' }),
    )
    expect(screen.queryByText('noop')).not.toBeInTheDocument()
    expect(screen.queryByTestId('update-save-error-a1')).not.toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: 'Edit Revolut' }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('update-edit-delta-a1')).not.toBeInTheDocument()
  })

  it('persists a pencil edit from the diskette and returns to read-only (#297)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    setDateField(await screen.findByLabelText('As of'), '2026-08-01')
    await user.click(
      await screen.findByRole('button', { name: 'Edit Revolut' }),
    )
    const amount = await screen.findByLabelText('Revolut new amount')
    await user.clear(amount)
    await user.type(amount, '1600')
    await user.clear(screen.getByLabelText('Revolut note'))
    await user.type(screen.getByLabelText('Revolut note'), 'After pencil')
    await user.click(
      screen.getByRole('button', { name: 'Save remaining for Revolut' }),
    )
    await waitFor(() => {
      expect(useAssetStore.getState().snapshots[0]).toMatchObject({
        amount: 1600,
        note: 'After pencil',
        date: '2026-08-01',
      })
    })
    expect(
      await screen.findByRole('button', { name: 'Edit Revolut' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText('Revolut new amount'),
    ).not.toBeInTheDocument()
    expect(
      await screen.findByTestId('update-save-status-a1'),
    ).toHaveTextContent('Saved')
    expect(screen.queryByText('noop')).not.toBeInTheDocument()
  })

  it('uses the diskette icon for remaining and comment field saves (#288)', async () => {
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const remaining = await screen.findByRole('button', {
      name: 'Save remaining for Revolut',
    })
    expect(remaining.querySelector('.lucide-save')).toBeTruthy()
    expect(remaining.querySelector('.lucide-check')).toBeFalsy()
    expect(
      screen.queryByRole('button', { name: 'Save comment for Revolut' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Save updates' }),
    ).toBeInTheDocument()
  })

  it('keeps classic Update when the new UX toggle is off (#295)', async () => {
    const user = userEvent.setup()
    await db.settings.put({ ...DEFAULT_SETTINGS, newUpdateUx: false })
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, newUpdateUx: false },
      loaded: true,
    })
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const amount = await screen.findByLabelText('Revolut new amount')
    const note = screen.getByLabelText('Revolut note')
    expect(
      amount.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: 'Given / received' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Save remaining for Revolut' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Save comment for Revolut' }),
    ).not.toBeInTheDocument()
    await user.type(amount, '1500')
    await user.type(note, 'Classic note')
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.find(
            (row) => row.assetId === 'a1' && row.date === todayIsoDate(),
          ),
      ).toMatchObject({ amount: 1500, note: 'Classic note' })
    })
  })

  it('puts the comment under remaining and saves both with one diskette (#294)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    const amount = await screen.findByLabelText('Revolut new amount')
    const note = screen.getByLabelText('Revolut note')
    expect(
      amount.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: 'Save comment for Revolut' }),
    ).not.toBeInTheDocument()
    await user.type(amount, '1500')
    await user.type(note, 'Top-up')
    await user.click(
      screen.getByRole('button', { name: 'Save remaining for Revolut' }),
    )
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.find(
            (row) => row.assetId === 'a1' && row.date === todayIsoDate(),
          ),
      ).toMatchObject({ amount: 1500, note: 'Top-up' })
    })
  })
})
