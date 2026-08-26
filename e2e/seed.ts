import type { Page } from '@playwright/test'

/** Seed IndexedDB so onboarding is skipped and Allocation has multi-currency Original data (#118). */
export async function seedValidationFixture(
  page: Page,
  options?: { currencyDisplayMode?: 'native' | 'base' },
) {
  const currencyDisplayMode = options?.currencyDisplayMode ?? 'native'
  await page.goto('/settings')
  await page.waitForFunction(() => document.readyState === 'complete')
  await page.evaluate(async (mode) => {
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
          locale: 'en',
          currencyDisplayMode: mode,
          onboardingCompleted: true,
          assetListSort: 'custom',
          assetListOrder: [],
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
  }, currencyDisplayMode)
  await page.reload()
  await page.getByRole('heading', { name: 'More' }).waitFor({ timeout: 15_000 })
}
