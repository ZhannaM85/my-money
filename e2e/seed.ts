import type { Page } from '@playwright/test'

/** Seed IndexedDB so onboarding is skipped and Allocation has multi-currency Original data (#118). */
export async function seedValidationFixture(
  page: Page,
  options?: {
    currencyDisplayMode?: 'native' | 'base'
    locale?: 'en' | 'ru'
    newUpdateUx?: boolean
  },
) {
  const currencyDisplayMode = options?.currencyDisplayMode ?? 'native'
  const locale = options?.locale ?? 'en'
  const newUpdateUx = options?.newUpdateUx ?? true
  await page.goto('/settings')
  await page.waitForFunction(
    () =>
      new Promise<boolean>((resolve) => {
        const open = indexedDB.open('my-money')
        open.onerror = () => resolve(false)
        open.onsuccess = () => {
          const database = open.result
          const ready = ['settings', 'assets', 'snapshots'].every((name) =>
            database.objectStoreNames.contains(name),
          )
          database.close()
          resolve(ready)
        }
      }),
  )
  await page.evaluate(async ({ mode, locale, newUpdateUx }) => {
    const now = '2026-08-17T00:00:00.000Z'

    await new Promise<void>((resolve, reject) => {
      // Open the existing schema without the optional indexedDB.databases API.
      const open = indexedDB.open('my-money')
      open.onerror = () => reject(open.error ?? new Error('idb open failed'))
      open.onsuccess = () => {
        const db = open.result
        const needed = ['settings', 'assets', 'snapshots'] as const
        for (const name of needed) {
          if (!db.objectStoreNames.contains(name)) {
            db.close()
            reject(new Error(`missing store ${name}`))
            return
          }
        }
        const tx = db.transaction([...needed], 'readwrite')
        tx.objectStore('settings').put({
          id: 'singleton',
          baseCurrency: 'EUR',
          locale,
          currencyDisplayMode: mode,
          onboardingCompleted: true,
          assetListSort: 'custom',
          assetListOrder: [],
          newUpdateUx,
          updatedAt: now,
        })
        tx.objectStore('assets').clear()
        tx.objectStore('snapshots').clear()
        tx.objectStore('assets').put({
          id: 'eur-cash',
          name: 'Euro cash',
          assetClass: 'money',
          type: 'cash',
          currency: 'EUR',
          trackingStatus: 'included',
          valuationMethod: 'account_balance',
          updateFrequency: 'weekly',
          createdAt: now,
          updatedAt: now,
        })
        tx.objectStore('assets').put({
          id: 'usd-cash',
          name: 'USD cash',
          assetClass: 'money',
          type: 'cash',
          currency: 'USD',
          trackingStatus: 'included',
          valuationMethod: 'account_balance',
          updateFrequency: 'weekly',
          createdAt: now,
          updatedAt: now,
        })
        tx.objectStore('snapshots').put({
          id: 's-eur',
          assetId: 'eur-cash',
          date: '2026-08-17',
          amount: 1000,
          currency: 'EUR',
        })
        tx.objectStore('snapshots').put({
          id: 's-usd',
          assetId: 'usd-cash',
          date: '2026-08-17',
          amount: 8000,
          currency: 'USD',
        })
        tx.oncomplete = () => {
          db.close()
          resolve()
        }
        tx.onerror = () => reject(tx.error ?? new Error('idb write failed'))
      }
    })
  }, { mode: currencyDisplayMode, locale, newUpdateUx })
  await page.reload()
  await page
    .getByRole('heading', { name: locale === 'ru' ? 'Ещё' : 'More' })
    .waitFor({ timeout: 15_000 })
}
