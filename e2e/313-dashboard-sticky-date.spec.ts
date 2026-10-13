import { expect, test } from '@playwright/test'
import { seedValidationFixture } from './seed'

for (const width of [393, 1024]) {
  test(`summary and date controls stay separated while scrolling at ${width}px (#313)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 700 })
    await page.route('https://**/*', (route) => route.abort())
    await seedValidationFixture(page, {
      currencyDisplayMode: 'base',
      locale: 'ru',
    })
    await page.goto('/')
    const summary = page.getByTestId('dashboard-sticky-summary')
    const dateBar = page.getByTestId('dashboard-as-of-bar')
    await expect(summary).toContainText('Чистый капитал')
    await expect(dateBar).toBeVisible()
    for (const scrollTop of [0, 50, 100, 180, 300, 500, 300, 180, 100, 50, 0]) {
      await page.locator('#main-content').evaluate((main, top) => {
        main.scrollTop = top
      }, scrollTop)
      await expect
        .poll(async () => {
          const card = await summary.boundingBox()
          const date = await dateBar.boundingBox()
          return date!.y - (card!.y + card!.height)
        })
        .toBeGreaterThanOrEqual(-1)
      if (scrollTop === 500) {
        await page.screenshot({
          path: `e2e/artifacts/313-dashboard-scroll-${width}.png`,
        })
      }
    }
    // Changing display mode changes the summary height; the sticky offset must follow.
    await page.goto('/settings')
    await seedValidationFixture(page, {
      currencyDisplayMode: 'native',
      locale: 'ru',
    })
    await page.goto('/')
    await expect(summary).toContainText('Чистый капитал')
    await page.locator('#dashboard-currency-filter').selectOption('EUR')
    await expect(dateBar).toBeVisible()
    await page.locator('#main-content').evaluate((main) => {
      main.scrollTop = 250
    })
    await expect
      .poll(async () => {
        const card = await summary.boundingBox()
        const date = await dateBar.boundingBox()
        return date!.y - (card!.y + card!.height)
      })
      .toBeGreaterThanOrEqual(-1)
    await page.screenshot({
      path: `e2e/artifacts/313-dashboard-native-${width}.png`,
    })
  })
}
