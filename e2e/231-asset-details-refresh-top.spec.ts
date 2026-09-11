import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '231')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

test('asset details shows refresh then collapsed Сведения near the top (#231)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedValidationFixture(page, { locale: 'ru' })
  await page.goto('/assets/usd-cash')
  await expect(page.getByRole('heading', { name: 'USD cash' })).toBeVisible()
  const update = page.getByRole('heading', { name: 'Обновить этот актив' })
  const details = page.getByRole('button', { name: 'Сведения', exact: true })
  const save = page.getByRole('button', { name: 'Сохранить' })
  const chart = page.getByTestId('net-worth-chart')
  await expect(update).toBeVisible()
  await expect(save).toBeVisible()
  await expect(details).toBeVisible()
  await expect(details).toHaveAttribute('aria-expanded', 'false')
  await expect(
    page.getByRole('button', { name: 'Изменить сведения' }),
  ).toHaveCount(0)

  const updateBox = await update.boundingBox()
  const detailsBox = await details.boundingBox()
  const saveBox = await save.boundingBox()
  const chartBox = await chart.boundingBox()
  expect(updateBox).toBeTruthy()
  expect(detailsBox).toBeTruthy()
  expect(saveBox).toBeTruthy()
  expect(chartBox).toBeTruthy()
  expect(updateBox!.y).toBeLessThan(saveBox!.y)
  expect(saveBox!.y).toBeLessThan(detailsBox!.y)
  expect(detailsBox!.y).toBeLessThan(chartBox!.y)
  expect(updateBox!.y).toBeLessThan(500)

  await page.screenshot({
    path: join(proofDir, '231-asset-details-refresh-top-collapsed.png'),
  })

  await details.click()
  await expect(details).toHaveAttribute('aria-expanded', 'true')
  const editDetails = page.getByRole('button', { name: 'Изменить сведения' })
  await expect(editDetails).toBeVisible()
  await details.evaluate((element) => {
    element.scrollIntoView({ block: 'start' })
  })
  await page.screenshot({
    path: join(proofDir, '231-asset-details-svedeniya-expanded.png'),
  })
})
