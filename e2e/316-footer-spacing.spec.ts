import { expect, test } from '@playwright/test'
import { seedValidationFixture } from './seed'

for (const newUpdateUx of [true, false]) {
  test(`Update scroll area reaches footer (new UX: ${newUpdateUx})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 640 })
    await seedValidationFixture(page, { newUpdateUx })
    await page.goto('/update')
    const scroll = page.getByTestId('update-holdings-scroll')
    await expect(scroll).toBeVisible()
    const nav = page.getByRole('navigation', { name: 'Tabs' })
    const bottom = newUpdateUx ? scroll : page.getByTestId('update-save-bar')
    await expect
      .poll(async () => {
        const contentBox = await bottom.boundingBox()
        const navBox = await nav.boundingBox()
        return Math.abs(navBox!.y - contentBox!.y - contentBox!.height)
      })
      .toBeLessThan(2)
    await scroll.evaluate((element) => {
      element.scrollTop = element.scrollHeight
    })
    const lastRow = scroll.locator('li').last()
    const lastBox = await lastRow.boundingBox()
    const scrollBox = await scroll.boundingBox()
    expect(lastBox!.y + lastBox!.height).toBeLessThanOrEqual(
      scrollBox!.y + scrollBox!.height,
    )
    await page.screenshot({
      path: `e2e/artifacts/316-update-${newUpdateUx}.png`,
    })
  })
}

test('Comparison scrolls all rows and totals above the footer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 400 })
  await seedValidationFixture(page)
  await page.evaluate(() =>
    localStorage.setItem(
      'my-money-comparison',
      JSON.stringify({
        state: { dates: ['2026-08-17', '2026-08-25'] },
        version: 0,
      }),
    ),
  )
  await page.goto('/compare')
  const total = page.getByTestId('comparison-total-2026-08-17')
  await expect(total).toBeAttached()
  const main = page.locator('#main-content')
  await main.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  const totalBox = await total.boundingBox()
  const navBox = await page
    .getByRole('navigation', { name: 'Tabs' })
    .boundingBox()
  expect(totalBox!.y + totalBox!.height).toBeLessThanOrEqual(navBox!.y)
  const scrollState = await main.evaluate((element) => ({
    height: element.scrollHeight,
    client: element.clientHeight,
  }))
  expect(scrollState.height).toBeGreaterThan(scrollState.client)
  await page.screenshot({ path: 'e2e/artifacts/316-comparison.png' })
})
