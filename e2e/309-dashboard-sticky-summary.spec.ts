import { expect, test } from '@playwright/test'
import { seedValidationFixture } from './seed'

for (const mode of ['base', 'native'] as const) {
  for (const width of [393, 1024]) {
    test(`dashboard summary stays visible in ${mode} at ${width}px (#309)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 400 })
      await page.route('https://**/*', (route) => route.abort())
      await seedValidationFixture(page, { currencyDisplayMode: mode })
      await page.goto('/')
      const summary = page.getByTestId('dashboard-sticky-summary')
      await expect(summary).toContainText('Net worth')
      const value = await summary.textContent()
      await page.locator('#main-content').evaluate((main) => { main.scrollTop = 150 })
      await expect.poll(async () => (await summary.boundingBox())?.y).toBeCloseTo(
        (await page.locator('#main-content').boundingBox())!.y, 0,
      )
      await expect(summary).toHaveText(value!)
      await page.screenshot({ path: `e2e/artifacts/309-dashboard-${mode}-${width}.png` })
    })
  }
}
