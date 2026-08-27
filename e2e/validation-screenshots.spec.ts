import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const outDir = join('e2e', 'artifacts')

test.beforeAll(() => {
  mkdirSync(outDir, { recursive: true })
})

test('capture Allocation Original Class/Currency (#108, #118, #121)', async ({
  page,
}) => {
  await seedValidationFixture(page)
  await page.goto('/allocation')
  await expect(page.getByRole('heading', { name: 'Allocation' })).toBeVisible()
  await expect(
    page.getByText(/Native amounts by class or type/),
  ).toBeVisible()
  await expect(page.getByTestId('allocation-chart')).toBeVisible()
  await page.screenshot({
    path: join(outDir, '108-allocation-original-class.png'),
    fullPage: true,
  })
  await page.screenshot({
    path: join(outDir, '121-allocation-original-class.png'),
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Currency' }).click()
  await expect(page.getByText(/Native amounts by currency/)).toBeVisible()
  await page.screenshot({
    path: join(outDir, '108-allocation-original-currency.png'),
    fullPage: true,
  })
  await page.screenshot({
    path: join(outDir, '121-allocation-original-currency.png'),
    fullPage: true,
  })
})

test('capture Dashboard chart controls and As of (#111, #112, #116, #117)', async ({
  page,
}) => {
  await seedValidationFixture(page, { currencyDisplayMode: 'base' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Earlier dates' }),
  ).toBeVisible()
  await expect(page.getByLabel('As of')).toBeVisible()
  await page.screenshot({
    path: join(outDir, 'dashboard-chart-and-asof.png'),
    fullPage: true,
  })
})

test('capture duplicate soft warning orange (#119)', async ({ page }) => {
  await seedValidationFixture(page)
  await page.goto('/assets/eur-cash')
  await expect(page.getByRole('heading', { name: 'Euro cash' })).toBeVisible()
  const asOf = page.getByLabel('As of').first()
  await asOf.fill('2026-08-17')
  await page.getByLabel('New amount').fill('1000')
  await expect(
    page.getByText(/A snapshot with this date and amount already exists/),
  ).toBeVisible()
  await page.screenshot({
    path: join(outDir, '119-duplicate-soft-warning.png'),
    fullPage: true,
  })
})
