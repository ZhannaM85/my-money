import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const outDir = join('e2e', 'artifacts')

test.beforeAll(() => {
  mkdirSync(outDir, { recursive: true })
})

test.use({ viewport: { width: 360, height: 800 } })

test('capture Dashboard zoom-out wrap in Russian (#195)', async ({ page }) => {
  await seedValidationFixture(page, { currencyDisplayMode: 'base' })
  await page.goto('/settings')
  await page.getByLabel('Language').selectOption('ru')
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Сводка' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Уменьшить' })).toBeVisible()
  await expect(page.getByTestId('chart-range-toolbar')).toBeVisible()
  await page.screenshot({
    path: join(outDir, '195-dashboard-zoom-out.png'),
    fullPage: true,
  })
})
