import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '280')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('Given/received headline is explicit entries; saved lines editable (#280, #282)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedValidationFixture(page, { locale: 'ru' })

  await page.goto('/update')
  await expect(page.getByRole('heading', { name: 'Обновить' })).toBeVisible()
  const usdCard = page.locator('li').filter({ hasText: 'USD cash' })
  await usdCard.getByRole('button', { name: 'Отдано / получено' }).click()
  await page.getByLabel('Запись 1 для USD cash').fill('1500')
  await page
    .getByLabel('Комментарий к записи 1 для USD cash')
    .fill('Антону за низ участка')
  await page.getByRole('button', { name: 'Добавить запись' }).click()
  await page.getByLabel('Запись 2 для USD cash').fill('800')
  await page
    .getByLabel('Комментарий к записи 2 для USD cash')
    .fill('Общая карта 70,000 рублей')
  await page.getByRole('button', { name: 'Сохранить обновления' }).click()
  await expect(
    page.getByLabel('Комментарий к записи 1 для USD cash'),
  ).toHaveValue('Антону за низ участка')
  await expect(
    page.getByLabel('Комментарий к записи 2 для USD cash'),
  ).toHaveValue('Общая карта 70,000 рублей')
  await expect(usdCard).toContainText(/2\s?300,00/)
  await expect(usdCard).not.toContainText(/40\s?875,00/)
  await usdCard.screenshot({
    path: join(proofDir, '280-update-editable-spends.png'),
  })
  await usdCard.screenshot({
    path: join(proofDir, '280-update-given-spent-headline.png'),
  })

  await page.getByLabel('Запись 1 для USD cash').fill('1200')
  await page.getByRole('button', { name: 'Удалить запись 2' }).click()
  await page.getByRole('button', { name: 'Сохранить обновления' }).click()
  await expect(
    page.getByLabel('Комментарий к записи 1 для USD cash'),
  ).toHaveValue('Антону за низ участка')
  await expect(page.getByLabel('Комментарий к записи 2 для USD cash')).toHaveCount(
    0,
  )

  await page.goto('/assets/usd-cash')
  await expect(page.getByRole('heading', { name: 'USD cash' })).toBeVisible()
  await page.getByRole('button', { name: 'Отдано / получено' }).click()
  await expect(page.getByLabel('Комментарий к записи 1')).toHaveValue(
    'Антону за низ участка',
  )
  await expect(page.getByRole('button', { name: 'Получено' }).first()).toBeVisible()
  await page.screenshot({
    path: join(proofDir, '280-asset-detail-editable-spends.png'),
  })
})
