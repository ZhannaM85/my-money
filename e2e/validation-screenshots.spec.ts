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

test('capture Allocation Class/Currency expanded holdings (#122)', async ({
  page,
}) => {
  await seedValidationFixture(page)
  await page.goto('/allocation')
  await expect(page.getByRole('heading', { name: 'Allocation' })).toBeVisible()
  await page.getByRole('button', { name: 'Money · USD · Holdings' }).click()
  await expect(page.getByText('USD cash')).toBeVisible()
  await page.screenshot({
    path: join(outDir, '122-allocation-class-expanded.png'),
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Currency' }).click()
  await expect(page.getByText(/Native amounts by currency/)).toBeVisible()
  await page.getByRole('button', { name: 'USD · Holdings' }).click()
  await expect(page.getByText('USD cash')).toBeVisible()
  await page.screenshot({
    path: join(outDir, '122-allocation-currency-expanded.png'),
    fullPage: true,
  })
})

test('capture Allocation Type expanded holdings (#123)', async ({ page }) => {
  await seedValidationFixture(page)
  await page.goto('/allocation')
  await expect(page.getByRole('heading', { name: 'Allocation' })).toBeVisible()
  await page.getByRole('button', { name: 'Type' }).click()
  await page.getByRole('button', { name: 'Cash · USD · Holdings' }).click()
  await expect(page.getByText('USD cash')).toBeVisible()
  await page.screenshot({
    path: join(outDir, '123-allocation-type-expanded.png'),
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

test('capture Dashboard Positions total for As of (#124)', async ({ page }) => {
  await seedValidationFixture(page, { currencyDisplayMode: 'base' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await page.getByLabel('As of').fill('2026-08-17')
  await expect(
    page.getByRole('button', { name: 'Holdings on 2026-08-17' }),
  ).toBeVisible()
  await expect(page.getByTestId('positions-total')).toBeVisible()
  await page.screenshot({
    path: join(outDir, '124-dashboard-positions-total.png'),
    fullPage: true,
  })
})

test('capture Dashboard As of Today button (#125)', async ({ page }) => {
  await seedValidationFixture(page, { currencyDisplayMode: 'base' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await page.getByLabel('As of').fill('2026-08-17')
  await expect(page.getByRole('button', { name: 'Today' })).toBeVisible()
  await page.screenshot({
    path: join(outDir, '125-dashboard-asof-today.png'),
    fullPage: true,
  })
})

test('capture Dashboard chart range picker (#126)', async ({ page }) => {
  await seedValidationFixture(page, { currencyDisplayMode: 'base' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  const rangeGroup = page.getByRole('group', { name: 'Chart range' })
  await expect(rangeGroup.getByRole('button', { name: 'Week' })).toBeVisible()
  await expect(rangeGroup.getByRole('button', { name: 'Custom' })).toBeVisible()
  await page.screenshot({
    path: join(outDir, '126-dashboard-range-picker.png'),
    fullPage: true,
  })
  await rangeGroup.getByRole('button', { name: 'Custom' }).click()
  await expect(page.getByRole('textbox', { name: 'From' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'To' })).toBeVisible()
  await page.screenshot({
    path: join(outDir, '126-dashboard-range-custom.png'),
    fullPage: true,
  })
})

test('capture Positions swipe Hide (#146)', async ({ page }) => {
  await seedValidationFixture(page, { currencyDisplayMode: 'base' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await page.getByRole('button', { name: 'Holdings' }).click()
  await expect(page.getByText('Euro cash')).toBeVisible()
  const row = page.getByText('Euro cash')
  const box = await row.boundingBox()
  if (!box) throw new Error('missing row')
  await page.mouse.move(box.x + box.width - 8, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + 8, box.y + box.height / 2, { steps: 8 })
  await page.mouse.up()
  await expect(page.getByRole('button', { name: 'Hide Euro cash' })).toBeVisible()
  await page.screenshot({
    path: join(outDir, '146-positions-swipe-hide.png'),
    fullPage: true,
  })
})

test('capture Positions hidden disabled state (#148)', async ({ page }) => {
  await seedValidationFixture(page, { currencyDisplayMode: 'base' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await page.getByRole('button', { name: 'Holdings' }).click()
  await expect(page.getByText('Euro cash')).toBeVisible()
  const row = page.getByText('Euro cash')
  const box = await row.boundingBox()
  if (!box) throw new Error('missing row')
  await page.mouse.move(box.x + box.width - 8, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + 8, box.y + box.height / 2, { steps: 8 })
  await page.mouse.up()
  await page.getByRole('button', { name: 'Hide Euro cash' }).evaluate((el) =>
    (el as HTMLButtonElement).click(),
  )
  await expect(page.locator('[data-excluded="true"]')).toBeVisible()
  await page.screenshot({
    path: join(outDir, '148-positions-hidden-disabled.png'),
    fullPage: true,
  })
})

test('capture Positions hidden excluded from total (#147)', async ({ page }) => {
  await seedValidationFixture(page, { currencyDisplayMode: 'base' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await page.getByRole('button', { name: 'Holdings' }).click()
  await expect(page.getByText('Euro cash')).toBeVisible()
  await page.getByRole('button', { name: 'Hide Euro cash' }).evaluate((el) =>
    (el as HTMLButtonElement).click(),
  )
  await expect(page.locator('[data-excluded="true"]')).toBeVisible()
  await expect(page.getByTestId('positions-total')).not.toContainText('1,000')
  await page.screenshot({
    path: join(outDir, '147-positions-hidden-from-total.png'),
    fullPage: true,
  })
})

test('capture Positions ownership share (#151)', async ({ page }) => {
  await seedValidationFixture(page, { currencyDisplayMode: 'base' })
  await page.evaluate(async () => {
    const now = '2026-08-17T00:00:00.000Z'
    const version = await (async () => {
      const listed = await indexedDB.databases?.()
      const existing = listed?.find((row) => row.name === 'my-money')
      return existing?.version && existing.version > 0 ? existing.version : 2
    })()
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open('my-money', version)
      open.onerror = () => reject(open.error ?? new Error('idb open failed'))
      open.onsuccess = () => {
        const db = open.result
        const tx = db.transaction(['assets', 'snapshots'], 'readwrite')
        tx.objectStore('assets').put({
          id: 'ruchyi',
          name: 'Квартира Ручьи',
          assetClass: 'property',
          type: 'apartment',
          currency: 'EUR',
          trackingStatus: 'included',
          valuationMethod: 'account_balance',
          updateFrequency: 'yearly',
          ownershipShareNumerator: 1,
          ownershipShareDenominator: 2,
          createdAt: now,
          updatedAt: now,
        })
        tx.objectStore('snapshots').put({
          id: 's-ruchyi',
          assetId: 'ruchyi',
          date: '2026-08-17',
          amount: 7_200_000,
          currency: 'EUR',
        })
        tx.oncomplete = () => {
          db.close()
          resolve()
        }
        tx.onerror = () => reject(tx.error ?? new Error('idb tx failed'))
      }
    })
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await page.getByRole('button', { name: 'Holdings' }).click()
  await expect(page.getByText('Квартира Ручьи')).toBeVisible()
  await expect(page.getByText('Your share: 1/2')).toBeVisible()
  await page.screenshot({
    path: join(outDir, '151-positions-ownership-share.png'),
    fullPage: true,
  })
})

test('capture Add asset Quick add House chip (#149)', async ({ page }) => {
  await seedValidationFixture(page)
  await page.goto('/assets/new')
  await expect(page.getByRole('heading', { name: 'Add asset' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'House' })).toBeVisible()
  await page.getByRole('button', { name: 'House' }).click()
  await expect(page.getByLabel('Type')).toHaveValue('house')
  await page.screenshot({
    path: join(outDir, '149-add-asset-house-chip.png'),
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
