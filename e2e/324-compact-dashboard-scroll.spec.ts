import { expect, test, type Page } from '@playwright/test'
import { seedValidationFixture } from './seed'

async function setCompactDashboardPositions(page: Page, compact: boolean) {
  await page.evaluate(async (next) => {
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open('my-money')
      open.onerror = () => reject(open.error ?? new Error('idb open failed'))
      open.onsuccess = () => {
        const db = open.result
        const tx = db.transaction(
          ['settings', 'assets', 'snapshots'],
          'readwrite',
        )
        const settings = tx.objectStore('settings')
        const readSettings = settings.get('singleton')
        readSettings.onerror = () =>
          reject(readSettings.error ?? new Error('settings read failed'))
        readSettings.onsuccess = () => {
          settings.put({
            ...readSettings.result,
            compactDashboardPositions: next,
          })
        }
        const assets = tx.objectStore('assets')
        const snapshots = tx.objectStore('snapshots')
        for (let index = 0; index < 18; index += 1) {
          const id = `extra-${index}`
          assets.put({
            id,
            name: `Extra cash ${index}`,
            assetClass: 'money',
            type: 'cash',
            currency: 'EUR',
            trackingStatus: 'included',
            valuationMethod: 'account_balance',
            updateFrequency: 'weekly',
            createdAt: '2026-08-17T00:00:00.000Z',
            updatedAt: '2026-08-17T00:00:00.000Z',
          })
          snapshots.put({
            id: `snap-${id}`,
            assetId: id,
            date: '2026-08-17',
            amount: 10 + index,
            currency: 'EUR',
          })
        }
        tx.oncomplete = () => {
          db.close()
          resolve()
        }
        tx.onerror = () =>
          reject(tx.error ?? new Error('settings write failed'))
      }
    })
  }, compact)
}

test('compact density scrolls the dashboard top block away (#324)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 700 })
  await page.route('https://**/*', (route) => route.abort())
  await seedValidationFixture(page, { currencyDisplayMode: 'base' })
  await setCompactDashboardPositions(page, true)
  await page.goto('/')

  const summary = page.getByTestId('dashboard-sticky-summary')
  await expect(summary).toContainText('Net worth')
  await expect(page.getByRole('button', { name: 'Compact' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: 'Holdings' }).click()
  await expect(page.getByText('Extra cash 17')).toHaveCount(1)

  const measurement = await page.evaluate(() => {
    const main = document.querySelector('#main-content')
    const summaryEl = document.querySelector(
      '[data-testid="dashboard-sticky-summary"]',
    )
    const dateEl = document.querySelector('[data-testid="dashboard-as-of-bar"]')
    const totalEl = document.querySelector('[data-testid="positions-total"]')
    const heading = document.querySelector('h1')
    if (
      !(main instanceof HTMLElement) ||
      !(summaryEl instanceof HTMLElement) ||
      !(dateEl instanceof HTMLElement) ||
      !(totalEl instanceof HTMLElement) ||
      !(heading instanceof HTMLElement)
    ) {
      return { ok: false as const, reason: 'missing nodes' }
    }
    const top = (node: HTMLElement) => node.getBoundingClientRect().top
    const room = main.scrollHeight - main.clientHeight
    if (room < 320) return { ok: false as const, reason: 'short page', room }
    main.scrollTop = 0
    const atTop = {
      heading: top(heading),
      summary: top(summaryEl),
      dateBar: top(dateEl),
      total: top(totalEl),
      main: top(main),
    }
    main.scrollTop = 320
    const moved = {
      heading: atTop.heading - top(heading),
      summary: atTop.summary - top(summaryEl),
      dateBar: atTop.dateBar - top(dateEl),
      total: atTop.total - top(totalEl),
    }
    return {
      ok: true as const,
      scrollTop: main.scrollTop,
      atTop,
      moved,
      position: {
        summary: getComputedStyle(summaryEl).position,
        dateBar: getComputedStyle(dateEl).position,
        total: getComputedStyle(totalEl).position,
      },
    }
  })

  expect(measurement.ok, JSON.stringify(measurement)).toBe(true)
  if (!measurement.ok) return
  expect(measurement.scrollTop).toBe(320)
  expect(measurement.moved.heading).toBeGreaterThan(300)
  for (const key of ['summary', 'dateBar', 'total'] as const) {
    expect(
      Math.abs(measurement.moved[key] - measurement.moved.heading),
    ).toBeLessThan(2)
  }
  expect(measurement.atTop.summary).toBeGreaterThan(measurement.atTop.main)
  expect(measurement.atTop.summary - measurement.moved.summary).toBeLessThan(
    measurement.atTop.main,
  )
  expect(measurement.position).toEqual({
    summary: 'static',
    dateBar: 'static',
    total: 'static',
  })

  // Home-screen PWA only adds header safe-area padding. It does not pin
  // Dashboard content; Safari and standalone share #main-content.
  const standaloneCss = await page.evaluate(() => {
    const chunks: string[] = []
    for (const sheet of document.styleSheets) {
      let rules: CSSRuleList
      try {
        rules = sheet.cssRules
      } catch {
        continue
      }
      for (const rule of rules) {
        if (
          rule instanceof CSSMediaRule &&
          rule.conditionText.includes('display-mode') &&
          rule.conditionText.includes('standalone')
        ) {
          chunks.push(rule.cssText)
        }
      }
    }
    return chunks.join('\n')
  })
  expect(standaloneCss).toContain('.app-header-row')
  expect(standaloneCss).toContain('safe-area-inset-top')
  expect(standaloneCss).not.toContain('sticky')
  expect(standaloneCss).not.toContain('position')
})
