import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '292')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('Остаток has no secondary Новый остаток / ± row (#292)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedValidationFixture(page, { locale: 'ru' })

  await page.goto('/update')
  await expect(page.getByRole('heading', { name: 'Обновить' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Остаток', exact: true }).first(),
  ).toBeVisible()
  await expect(page.getByTestId('balance-entry-toggles')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Новый остаток', exact: true }),
  ).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Убрать' })).toHaveCount(0)
  await expect(page.getByLabel('Новая сумма для USD cash')).toBeVisible()
  await page.screenshot({
    path: join(proofDir, '292-update-absolute-remaining.png'),
  })

  await page.goto('/assets/usd-cash')
  await expect(page.getByRole('heading', { name: 'USD cash' })).toBeVisible()
  await expect(page.getByTestId('balance-entry-toggles')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Новый остаток', exact: true }),
  ).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Убрать' })).toHaveCount(0)
  await expect(page.getByLabel('Новая сумма')).toBeVisible()
  await page.screenshot({
    path: join(proofDir, '292-asset-detail-absolute-remaining.png'),
  })
})
