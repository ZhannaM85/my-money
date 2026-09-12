import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { seedValidationFixture } from './seed'

const proofDir = join('docs', 'validation-proof', '229')

test.beforeAll(() => {
  mkdirSync(proofDir, { recursive: true })
})

async function scrollMainToEnd(page: Page) {
  const main = page.locator('#main-content')
  await main.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
}

async function expectInsetAboveTabBar(page: Page) {
  const main = page.locator('#main-content')
  const inset = page.getByTestId('main-bottom-inset')
  const nav = page.getByRole('navigation', { name: 'Tabs' })
  await expect(inset).toBeAttached()
  const insetBox = await inset.boundingBox()
  const navBox = await nav.boundingBox()
  expect(insetBox).toBeTruthy()
  expect(navBox).toBeTruthy()
  expect(insetBox!.height).toBeGreaterThanOrEqual(32)
  expect(insetBox!.y + insetBox!.height).toBeLessThanOrEqual(navBox!.y + 1)
  const canScroll = await main.evaluate(
    (element) => element.scrollHeight - element.clientHeight > 1,
  )
  if (canScroll) {
    expect(navBox!.y - (insetBox!.y + insetBox!.height)).toBeLessThan(4)
  }
}

test('Settings last content keeps a gap above the tab bar (#229)', async ({
  page,
}) => {
  await seedValidationFixture(page)
  await page.goto('/settings')
  await expect(page.getByRole('heading', { name: 'More' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Developer' })).toBeVisible()
  await scrollMainToEnd(page)
  await expectInsetAboveTabBar(page)
  await page.screenshot({
    path: join(proofDir, '229-settings-tab-bar-inset.png'),
  })
})

test('Dashboard last control keeps a gap above the tab bar (#229)', async ({
  page,
}) => {
  await seedValidationFixture(page, { currencyDisplayMode: 'base' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Allocation' })).toBeVisible()
  await scrollMainToEnd(page)
  await expectInsetAboveTabBar(page)
  await page.screenshot({
    path: join(proofDir, '229-dashboard-tab-bar-inset.png'),
  })
})

test('Assets last row keeps a gap above the tab bar (#229)', async ({
  page,
}) => {
  await seedValidationFixture(page)
  await page.goto('/assets')
  await expect(page.getByRole('heading', { name: 'Assets' })).toBeVisible()
  await scrollMainToEnd(page)
  await expectInsetAboveTabBar(page)
  await page.screenshot({
    path: join(proofDir, '229-assets-tab-bar-inset.png'),
  })
})

test('History last day keeps a gap above the tab bar (#229)', async ({
  page,
}) => {
  await seedValidationFixture(page)
  await page.goto('/history')
  await expect(page.getByRole('heading', { name: 'History' })).toBeVisible()
  await scrollMainToEnd(page)
  await expectInsetAboveTabBar(page)
  await page.screenshot({
    path: join(proofDir, '229-history-tab-bar-inset.png'),
  })
})
