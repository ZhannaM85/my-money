import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '294')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('Остаток comment sits under amount with one diskette (#294)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedValidationFixture(page, { locale: 'ru' })

  await page.goto('/update')
  await expect(page.getByRole('heading', { name: 'Обновить' })).toBeVisible()
  const usdCard = page.locator('li').filter({ hasText: 'USD cash' }).first()
  const amount = page.getByLabel('Новая сумма для USD cash')
  const note = page.getByLabel('Комментарий для USD cash')
  await expect(amount).toBeVisible()
  await expect(note).toBeVisible()
  const amountBox = await amount.boundingBox()
  const noteBox = await note.boundingBox()
  expect(amountBox && noteBox).toBeTruthy()
  expect(noteBox!.y).toBeGreaterThan(amountBox!.y)
  await expect(
    usdCard.getByRole('button', { name: 'Сохранить остаток: USD cash' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Сохранить заметку: USD cash' }),
  ).toHaveCount(0)
  await page.screenshot({
    path: join(proofDir, '294-update-comment-under-amount.png'),
  })

  await page.goto('/assets/usd-cash')
  await expect(page.getByRole('heading', { name: 'USD cash' })).toBeVisible()
  const detailAmount = page.getByLabel('Новая сумма')
  const detailNote = page.getByLabel('Комментарий (необязательно)')
  await expect(detailAmount).toBeVisible()
  await expect(detailNote).toBeVisible()
  const detailAmountBox = await detailAmount.boundingBox()
  const detailNoteBox = await detailNote.boundingBox()
  expect(detailAmountBox && detailNoteBox).toBeTruthy()
  expect(detailNoteBox!.y).toBeGreaterThan(detailAmountBox!.y)
  await expect(
    page.getByRole('button', { name: 'Сохранить остаток' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Сохранить заметку' }),
  ).toHaveCount(0)
  await page.screenshot({
    path: join(proofDir, '294-asset-detail-comment-under-amount.png'),
  })
})
