import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '275')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('Update optional comment on a new balance shows in History (#275)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedValidationFixture(page, { locale: 'ru' })
  await page.goto('/update')
  await expect(page.getByRole('heading', { name: 'Обновить' })).toBeVisible()
  const amount = page.getByLabel('Новая сумма для USD cash')
  const note = page.getByLabel('Комментарий для USD cash')
  await expect(amount).toBeVisible()
  await expect(note).toBeVisible()
  await expect(note).toHaveAttribute(
    'placeholder',
    'Комментарий (необязательно)',
  )
  await amount.fill('5700')
  await note.fill('Сняла наличные')
  await page.screenshot({
    path: join(proofDir, '275-update-optional-comment.png'),
  })
  await page.getByRole('button', { name: 'Сохранить остаток: USD cash' }).click()
  await expect(page.getByTestId('update-note-saved-usd-cash')).toHaveText(
    'Сняла наличные',
  )

  await page.goto('/history')
  await expect(page.getByRole('heading', { name: 'История' })).toBeVisible()
  await page.getByRole('button', { name: 'Все' }).click()
  const today = new Date().toISOString().slice(0, 10)
  await page.getByTestId(`history-day-row-${today}`).getByRole('button').click()
  await expect(page.getByText('Сняла наличные')).toBeVisible()
  await page.screenshot({
    path: join(proofDir, '275-history-update-comment.png'),
  })
})
