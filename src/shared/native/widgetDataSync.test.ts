import { describe, expect, it } from 'vitest'
import { buildWidgetSnapshot } from './widgetDataSync'

describe('buildWidgetSnapshot (#190)', () => {
  it('omits amounts when the Settings toggle is off', () => {
    expect(
      buildWidgetSnapshot({
        enabled: false,
        total: 2426353.18,
        currency: 'RUB',
        asOf: '2026-08-28',
        locale: 'ru',
      }),
    ).toEqual({ enabled: false, headline: null, asOfText: null })
  })

  it('formats converted net worth and as-of when on', () => {
    const snapshot = buildWidgetSnapshot({
      enabled: true,
      total: 1000,
      currency: 'EUR',
      asOf: '2026-08-17',
      locale: 'en',
    })
    expect(snapshot.enabled).toBe(true)
    expect(snapshot.headline).toMatch(/1/)
    expect(snapshot.headline).toMatch(/€|EUR/)
    expect(snapshot.asOfText).toMatch(/As of/)
    expect(snapshot.asOfText).toMatch(/2026/)
  })
})
