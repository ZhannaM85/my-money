import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '276')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('Update and asset detail share remaining / ± entry (#276)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedValidationFixture(page, { locale: 'ru' })

  await page.goto('/update')
  await expect(page.getByRole('heading', { name: 'Обновить' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Остаток', exact: true }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Новый остаток', exact: true }).first(),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Убрать' }).first().click()
  await expect(
    page.getByRole('button', { name: 'Убрать' }).first(),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('asset-balance-update').first()).toBeVisible()
  await page.screenshot({
    path: join(proofDir, '276-update-delta-entry.png'),
  })

  await page.goto('/assets/usd-cash')
  await expect(page.getByRole('heading', { name: 'USD cash' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Обновить этот актив' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Остаток', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Новый остаток', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Убрать' }).click()
  await expect(page.getByRole('button', { name: 'Убрать' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByPlaceholder('Сумма')).toBeVisible()
  await page.screenshot({
    path: join(proofDir, '276-asset-detail-delta-entry.png'),
  })
})
