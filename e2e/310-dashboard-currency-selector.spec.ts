import { expect, test } from '@playwright/test'
import { seedValidationFixture } from './seed'

for (const mode of ['base', 'native'] as const) {
  test(`dashboard currency selector in ${mode} mode (#310)`, async ({ page }) => {
    await page.route('https://**/*', (route) => route.abort())
    await seedValidationFixture(page, { currencyDisplayMode: mode })
    await page.goto('/')
    await expect(page.getByTestId('dashboard-sticky-summary')).toContainText('Net worth')
    if (mode === 'base') {
      await expect(page.getByLabel('Currency', { exact: true })).toHaveCount(0)
      await expect(page.getByText('Currency', { exact: true })).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'About Currency' })).toHaveCount(0)
      await expect(page.getByTestId('dashboard-sticky-summary')).toContainText('€1,000.00')
      await expect(page.getByText('From amounts', { exact: true })).toBeVisible()
    } else {
      const selector = page.getByLabel('Currency', { exact: true })
      await expect(selector).toBeEnabled()
      await selector.selectOption('EUR')
      await expect(page.getByTestId('dashboard-sticky-summary')).toContainText('€1,000.00')
      await expect(selector).toHaveValue('EUR')
    }
    await page.screenshot({ path: `e2e/artifacts/310-dashboard-currency-${mode}.png` })
  })
}
