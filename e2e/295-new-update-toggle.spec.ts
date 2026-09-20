import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '295')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('New asset update toggle defaults off and gates the new UX (#295)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedValidationFixture(page, { locale: 'ru', newUpdateUx: false })

  await page.goto('/settings')
  await expect(
    page.getByRole('heading', { name: 'Переключатели функций' }),
  ).toBeVisible()
  const toggle = page.getByRole('switch', { name: 'Новое обновление активов' })
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await page.screenshot({
    path: join(proofDir, '295-settings-new-update-toggle.png'),
  })

  await page.goto('/update')
  await expect(page.getByRole('heading', { name: 'Обновить' })).toBeVisible()
  await expect(page.getByLabel('Новая сумма для USD cash')).toBeVisible()
  await expect(page.getByLabel('Комментарий для USD cash')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Сохранить обновления' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Отдано / получено' }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Сохранить остаток: USD cash' }),
  ).toHaveCount(0)
  await page.screenshot({
    path: join(proofDir, '295-update-classic.png'),
  })

  await page.goto('/settings')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', 'true')

  await page.goto('/update')
  await expect(
    page.getByRole('button', { name: 'Отдано / получено' }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Сохранить остаток: USD cash' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Сохранить обновления' }),
  ).toHaveCount(0)
  await page.screenshot({
    path: join(proofDir, '295-update-new-ux.png'),
  })
})
