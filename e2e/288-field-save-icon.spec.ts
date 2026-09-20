import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '288')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('Field-level saves use the diskette icon (#288)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedValidationFixture(page, { locale: 'ru' })

  await page.goto('/update')
  await expect(page.getByRole('heading', { name: 'Обновить' })).toBeVisible()

  const remainingSave = page.getByRole('button', {
    name: 'Сохранить остаток: USD cash',
  })
  await expect(remainingSave.locator('.lucide-save')).toBeVisible()
  await expect(remainingSave.locator('.lucide-check')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Сохранить заметку: USD cash' }),
  ).toHaveCount(0)
  await page.screenshot({
    path: join(proofDir, '288-update-field-save-diskette.png'),
  })

  const euroCard = page.locator('li').filter({ hasText: 'Euro cash' })
  await euroCard.getByRole('button', { name: 'Отдано / получено' }).click()
  const lineSave = page.getByRole('button', { name: 'Сохранить запись 1' })
  await expect(lineSave.locator('.lucide-save')).toBeVisible()
  await expect(lineSave.locator('.lucide-check')).toHaveCount(0)
  await euroCard.screenshot({
    path: join(proofDir, '288-update-spend-line-save-diskette.png'),
  })

  await page.goto('/assets/usd-cash')
  await expect(page.getByRole('heading', { name: 'USD cash' })).toBeVisible()
  const detailRemaining = page.getByRole('button', {
    name: 'Сохранить остаток',
  })
  await expect(detailRemaining.locator('.lucide-save')).toBeVisible()
  await expect(detailRemaining.locator('.lucide-check')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Сохранить заметку' }),
  ).toHaveCount(0)
  await page.screenshot({
    path: join(proofDir, '288-asset-detail-field-save-diskette.png'),
  })
})
