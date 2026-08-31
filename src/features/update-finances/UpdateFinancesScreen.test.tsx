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
  it('writes a same-amount snapshot when No change is saved', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: 'No change' }))
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.filter((row) => row.assetId === 'a1'),
      ).toHaveLength(2)
    })
    const snapshots = useAssetStore
      .getState()
      .snapshots.filter((row) => row.assetId === 'a1')
    expect(snapshots.some((row) => row.date === todayIsoDate())).toBe(true)
    expect(snapshots.filter((row) => row.amount === 1000)).toHaveLength(2)
  })

  it('defaults As of to today and saves every row on a chosen past date (#175)', async () => {
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
    const noChange = await screen.findAllByRole('button', { name: 'No change' })
    await user.click(noChange[0]!)
    await user.click(noChange[1]!)
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
    const user = userEvent.setup()
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
    await user.click(screen.getByRole('button', { name: 'No change' }))
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
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
    await user.click(await screen.findByRole('button', { name: 'No change' }))
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
    await screen.findByRole('button', { name: 'No change' })
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

  it('pre-fills and No-change uses the snapshot before As of, not a later latest (#180)', async () => {
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
    await user.click(screen.getByRole('button', { name: 'No change' }))
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
})
