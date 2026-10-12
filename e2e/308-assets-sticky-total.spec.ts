import { expect, test } from '@playwright/test'
import { seedValidationFixture } from './seed'

for (const width of [393, 1024]) {
  test(`assets total stays visible while scrolling at ${width}px (#308)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 })
    await page.route('https://**/*', (route) => route.abort())
    await seedValidationFixture(page, { currencyDisplayMode: 'base' })
    await page.evaluate(async () => {
      await new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('my-money')
        open.onerror = () => reject(open.error)
        open.onsuccess = () => {
          const db = open.result
          const tx = db.transaction('assets', 'readwrite')
          for (let i = 0; i < 25; i++) {
            tx.objectStore('assets').put({
              id: `extra-${i}`, name: `Extra ${i}`, assetClass: 'money',
              type: 'cash', currency: 'EUR', trackingStatus: 'included',
              valuationMethod: 'account_balance', updateFrequency: 'weekly',
              createdAt: '2026-08-17T00:00:00Z', updatedAt: '2026-08-17T00:00:00Z',
            })
          }
          tx.oncomplete = () => { db.close(); resolve() }
          tx.onerror = () => reject(tx.error)
        }
      })
    })
    await page.goto('/assets')
    const header = page.getByTestId('assets-sticky-header')
    await expect(header).toContainText('Total:')
    const total = await header.textContent()
    await page.locator('#main-content').evaluate((main) => { main.scrollTop = 500 })
    await expect.poll(async () => (await header.boundingBox())?.y).toBeCloseTo(
      (await page.locator('#main-content').boundingBox())!.y, 0,
    )
    await expect(header).toHaveText(total!)
    await expect(page.getByRole('link', { name: 'Add', exact: true })).toBeVisible()
    await page.screenshot({ path: `e2e/artifacts/308-assets-sticky-${width}.png` })
  })
}
