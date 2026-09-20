import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '283')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('Saved given/received lines are read-only until pencil (#283)', async ({
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
    .fill('Общая карта')
  await page.getByRole('button', { name: 'Сохранить запись 1' }).click()

  await expect(usdCard.getByTestId('spend-line-0')).toHaveAttribute(
    'data-editing',
    'false',
  )
  await expect(usdCard.getByTestId('spend-line-note-0')).toHaveText(
    'Антону за низ участка',
  )
  await expect(page.getByLabel('Запись 1 для USD cash')).toHaveCount(0)
  await usdCard.screenshot({
    path: join(proofDir, '283-update-readonly-spends.png'),
  })

  await usdCard.getByRole('button', { name: 'Изменить запись 1' }).click()
  await expect(usdCard.getByTestId('spend-line-0')).toHaveAttribute(
    'data-editing',
    'true',
  )
  await page.getByLabel('Запись 1 для USD cash').fill('1200')
  await usdCard.getByRole('button', { name: 'Сохранить запись 1' }).click()
  await expect(usdCard.getByTestId('spend-line-0')).toHaveAttribute(
    'data-editing',
    'false',
  )
  await usdCard.screenshot({
    path: join(proofDir, '283-update-after-line-save.png'),
  })

  await page.goto('/assets/usd-cash')
  await expect(page.getByRole('heading', { name: 'USD cash' })).toBeVisible()
  await page.getByRole('button', { name: 'Отдано / получено' }).click()
  await expect(page.getByTestId('spend-line-0')).toHaveAttribute(
    'data-editing',
    'false',
  )
  await expect(
    page.getByRole('button', { name: 'Изменить запись 1' }),
  ).toBeVisible()
  await page.screenshot({
    path: join(proofDir, '283-asset-detail-readonly-spends.png'),
  })
})
