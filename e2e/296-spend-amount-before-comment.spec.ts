import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '296')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('Given/received row shows amount before comment (#296)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedValidationFixture(page, { locale: 'ru', newUpdateUx: true })

  await page.goto('/update')
  await expect(page.getByRole('heading', { name: 'Обновить' })).toBeVisible()
  const usdCard = page.locator('li').filter({ hasText: 'USD cash' }).first()
  await usdCard.getByRole('button', { name: 'Отдано / получено' }).click()
  const amount = page.getByLabel('Запись 1 для USD cash')
  const note = page.getByLabel('Комментарий к записи 1 для USD cash')
  await expect(amount).toBeVisible()
  await expect(note).toBeVisible()
  const amountBox = await amount.boundingBox()
  const noteBox = await note.boundingBox()
  expect(amountBox && noteBox).toBeTruthy()
  expect(amountBox!.x).toBeLessThan(noteBox!.x)
  await page.screenshot({
    path: join(proofDir, '296-update-spend-amount-before-comment.png'),
  })
})
