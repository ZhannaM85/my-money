import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '284')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('Per-field save persists on Update and asset detail (#284)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedValidationFixture(page, { locale: 'ru' })

  await page.goto('/update')
  await expect(page.getByRole('heading', { name: 'Обновить' })).toBeVisible()
  await page.getByLabel('Новая сумма для USD cash').fill('5700')
  await page.getByLabel('Комментарий для USD cash').fill('Сняла наличные')
  await expect(
    page.getByRole('button', { name: 'Сохранить обновления' }),
  ).toHaveCount(0)
  await page.screenshot({
    path: join(proofDir, '284-update-field-save.png'),
  })
  await page
    .getByRole('button', { name: 'Сохранить остаток: USD cash' })
    .click()
  await expect(page.getByTestId('update-save-status-usd-cash')).toHaveText(
    'Сохранено',
  )
  await expect(page.getByTestId('update-note-saved-usd-cash')).toHaveText(
    'Сняла наличные',
  )

  const euroCard = page.locator('li').filter({ hasText: 'Euro cash' })
  await euroCard.getByRole('button', { name: 'Отдано / получено' }).click()
  await page.getByLabel('Запись 1 для Euro cash').fill('200')
  await page.getByLabel('Комментарий к записи 1 для Euro cash').fill('Подарок')
  await euroCard.screenshot({
    path: join(proofDir, '284-update-spend-line-save.png'),
  })
  await page.getByRole('button', { name: 'Сохранить запись 1' }).click()
  await expect(page.getByTestId('update-save-status-eur-cash')).toHaveText(
    'Сохранено',
  )
  await expect(page.getByTestId('spend-line-note-0')).toHaveText('Подарок')
  await expect(
    page.getByRole('button', { name: 'Сохранить обновления' }),
  ).toHaveCount(0)

  await page.goto('/assets/usd-cash')
  await expect(page.getByRole('heading', { name: 'USD cash' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Сохранить остаток' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Сохранить заметку' }),
  ).toHaveCount(0)
  await page.screenshot({
    path: join(proofDir, '284-asset-detail-field-save.png'),
  })
})
