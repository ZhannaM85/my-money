import { expect, test } from '@playwright/test'
import { seedValidationFixture } from './seed'

for (const locale of ['en', 'ru'] as const) {
  test(`rename an asset and confirm cancellation in ${locale} (#311)`, async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 800 })
    await page.route('https://**/*', (route) => route.abort())
    await seedValidationFixture(page, { currencyDisplayMode: 'native', locale })
    await page.goto('/assets/eur-cash')
    const labels = locale === 'en'
      ? { edit: 'Rename asset', name: 'Name', save: 'Save name', cancel: 'Cancel renaming', keep: 'Keep editing', discard: 'Discard changes' }
      : { edit: 'Переименовать актив', name: 'Название', save: 'Сохранить название', cancel: 'Отменить переименование', keep: 'Продолжить', discard: 'Отменить изменения' }
    await page.getByRole('button', { name: labels.edit, exact: true }).click()
    const input = page.getByRole('textbox', { name: labels.name, exact: true })
    await expect(input).toHaveValue('Euro cash')
    await input.fill('   ')
    await expect(page.getByRole('button', { name: labels.save, exact: true })).toBeDisabled()
    await input.fill('Holiday fund')
    await page.screenshot({ path: `e2e/artifacts/311-rename-editor-${locale}.png` })
    await page.getByRole('button', { name: labels.cancel, exact: true }).click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    expect(await page.locator('html').evaluate((html) => html.scrollWidth)).toBeLessThanOrEqual(393)
    const discardButton = modal.getByRole('button', { name: labels.discard, exact: true })
    const discardBounds = await discardButton.boundingBox()
    expect(discardBounds!.x + discardBounds!.width).toBeLessThanOrEqual(393)
    await page.screenshot({ path: `e2e/artifacts/311-rename-confirm-${locale}.png` })
    await modal.getByRole('button', { name: labels.keep, exact: true }).click()
    await expect(input).toHaveValue('Holiday fund')
    await page.getByRole('button', { name: labels.cancel, exact: true }).click()
    await modal.getByRole('button', { name: labels.discard, exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Euro cash', exact: true })).toBeVisible()
    await page.getByRole('button', { name: labels.edit, exact: true }).click()
    await input.fill('  Holiday fund  ')
    await page.getByRole('button', { name: labels.save, exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Holiday fund', exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Holiday fund', exact: true })).toBeVisible()
    await page.goto('/assets')
    await expect(page.getByRole('link', { name: /Holiday fund/ })).toHaveAttribute('href', '/assets/eur-cash')
  })
}
