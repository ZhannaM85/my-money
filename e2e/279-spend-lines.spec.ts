import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '279')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('Given/received spend lines on Update, asset detail, and History (#279)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedValidationFixture(page, { locale: 'ru' })

  await page.goto('/update')
  await expect(page.getByRole('heading', { name: 'Обновить' })).toBeVisible()
  const usdCard = page.locator('li').filter({ hasText: 'USD cash' })
  await usdCard.getByRole('button', { name: 'Отдано / получено' }).click()
  await expect(page.getByLabel('Запись 1 для USD cash')).toBeVisible()
  await page.getByLabel('Запись 1 для USD cash').fill('1000')
  await page.getByLabel('Комментарий к записи 1 для USD cash').fill('Подарок')
  await page.getByRole('button', { name: 'Добавить запись' }).click()
  await page.getByLabel('Запись 2 для USD cash').fill('2000')
  await page.getByLabel('Комментарий к записи 2 для USD cash').fill('Поездка')
  await expect(page.getByTestId('spend-lines')).toBeVisible()
  await page.screenshot({
    path: join(proofDir, '279-update-spend-lines.png'),
  })
  await page.getByRole('button', { name: 'Сохранить запись 1' }).click()
  await expect(page.getByTestId('spend-line-note-0')).toHaveText('Подарок')
  await expect(page.getByTestId('spend-line-note-1')).toHaveText('Поездка')
  await expect(page.getByLabel('Запись 1 для USD cash')).toHaveCount(0)

  await page.goto('/assets/usd-cash')
  await expect(page.getByRole('heading', { name: 'USD cash' })).toBeVisible()
  await expect(page.getByTestId('spend-line-note-0')).toHaveText('Подарок')
  await expect(page.getByTestId('spend-line-note-1')).toHaveText('Поездка')
  await page.screenshot({
    path: join(proofDir, '279-asset-detail-spend-lines.png'),
  })

  await page.goto('/history')
  await expect(page.getByRole('heading', { name: 'История' })).toBeVisible()
  await page.getByRole('button', { name: 'Все' }).click()
  const today = new Date().toISOString().slice(0, 10)
  await page.getByTestId(`history-day-row-${today}`).getByRole('button').click()
  await expect(page.getByText('Подарок')).toBeVisible()
  await expect(page.getByText('Поездка')).toBeVisible()
  await page.screenshot({
    path: join(proofDir, '279-history-same-day-spends.png'),
  })
})
