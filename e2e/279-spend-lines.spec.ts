import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '279')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('Given/spent spend lines on Update, asset detail, and History (#279)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedValidationFixture(page, { locale: 'ru' })

  await page.goto('/update')
  await expect(page.getByRole('heading', { name: 'Обновить' })).toBeVisible()
  const usdCard = page.locator('li').filter({ hasText: 'USD cash' })
  await usdCard.getByRole('button', { name: 'Отдано / потрачено' }).click()
  await expect(page.getByLabel('Трата 1 для USD cash')).toBeVisible()
  await page.getByLabel('Трата 1 для USD cash').fill('1000')
  await page.getByLabel('Комментарий к трате 1 для USD cash').fill('Подарок')
  await page.getByRole('button', { name: 'Добавить трату' }).click()
  await page.getByLabel('Трата 2 для USD cash').fill('2000')
  await page.getByLabel('Комментарий к трате 2 для USD cash').fill('Поездка')
  await expect(page.getByTestId('spend-lines')).toBeVisible()
  await page.screenshot({
    path: join(proofDir, '279-update-spend-lines.png'),
  })
  await page.getByRole('button', { name: 'Сохранить обновления' }).click()
  await expect(page.getByTestId('saved-spends-usd-cash')).toContainText(
    'Подарок',
  )
  await expect(page.getByTestId('saved-spends-usd-cash')).toContainText(
    'Поездка',
  )

  await page.goto('/assets/usd-cash')
  await expect(page.getByRole('heading', { name: 'USD cash' })).toBeVisible()
  await expect(page.getByLabel('Трата 1')).toBeVisible()
  await page.screenshot({
    path: join(proofDir, '279-asset-detail-spend-lines.png'),
  })
  await expect(page.getByText('Подарок')).toBeVisible()
  await expect(page.getByText('Поездка')).toBeVisible()

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
