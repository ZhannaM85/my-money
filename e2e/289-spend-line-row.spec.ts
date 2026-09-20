import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '289')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('Given/received purpose and amount share one row (#289)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedValidationFixture(page, { locale: 'ru' })

  await page.goto('/update')
  await expect(page.getByRole('heading', { name: 'Обновить' })).toBeVisible()
  const usdCard = page.locator('li').filter({ hasText: 'USD cash' })
  await usdCard.getByRole('button', { name: 'Отдано / получено' }).click()
  const editRow = usdCard.getByTestId('spend-line-values-0')
  await expect(
    editRow.getByLabel('Комментарий к записи 1 для USD cash'),
  ).toBeVisible()
  await expect(editRow.getByLabel('Запись 1 для USD cash')).toBeVisible()
  await page.getByLabel('Запись 1 для USD cash').fill('5000')
  await page
    .getByLabel('Комментарий к записи 1 для USD cash')
    .fill('Алихану на проезд')
  await usdCard.screenshot({
    path: join(proofDir, '289-update-spend-edit-row.png'),
  })
  await page.getByRole('button', { name: 'Сохранить запись 1' }).click()
  await expect(usdCard.getByTestId('spend-line-0')).toHaveAttribute(
    'data-editing',
    'false',
  )
  const viewRow = usdCard.getByTestId('spend-line-values-0')
  await expect(viewRow.getByTestId('spend-line-note-0')).toHaveText(
    'Алихану на проезд',
  )
  await expect(viewRow.getByTestId('spend-line-amount-0')).toBeVisible()
  await usdCard.screenshot({
    path: join(proofDir, '289-update-spend-view-row.png'),
  })

  await page.goto('/assets/usd-cash')
  await expect(page.getByRole('heading', { name: 'USD cash' })).toBeVisible()
  await page.getByRole('button', { name: 'Отдано / получено' }).click()
  await expect(page.getByTestId('spend-line-values-0')).toBeVisible()
  await page.screenshot({
    path: join(proofDir, '289-asset-detail-spend-row.png'),
  })
})
