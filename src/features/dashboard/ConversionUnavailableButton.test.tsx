import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearFxDebugLog,
  getFxDebugLog,
  setFxDebugEnabled,
} from '@/infrastructure/fx/fxDebug'
import { FxDebugSection } from '@/features/settings/FxDebugSection'
import { ConversionUnavailableButton } from './ConversionUnavailableButton'

beforeEach(() => {
  localStorage.clear()
  clearFxDebugLog()
  setFxDebugEnabled(false)
  vi.spyOn(console, 'info').mockImplementation(() => undefined)
})

describe('ConversionUnavailableButton (#196)', () => {
  it('turns on FX debug, logs pair and date, and opens the Settings log', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <ConversionUnavailableButton
                from="USD"
                to="RUB"
                date="2026-08-11"
                assetId="usd-cash"
              />
            }
          />
          <Route path="/settings" element={<FxDebugSection />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole('button', { name: 'Conversion not available' }),
    )

    expect(await screen.findByRole('heading', { name: 'FX debug' })).toBeVisible()
    const log = getFxDebugLog()
    expect(log.some((entry) => entry.message === 'conversion unavailable')).toBe(
      true,
    )
    const details = log.find((entry) => entry.message === 'conversion unavailable')
      ?.details as { from: string; to: string; date: string; platform: string }
    expect(details.from).toBe('USD')
    expect(details.to).toBe('RUB')
    expect(details.date).toBe('2026-08-11')
    expect(details.platform).toBe('pwa')
  })
})
