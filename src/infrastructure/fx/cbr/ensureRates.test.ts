import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { lookupRate } from '@/domain/fx'
import {
  db,
  IndexedDbFxRateRepository,
} from '@/infrastructure/persistence/indexeddb'
import { ensureCbrRates } from './ensureRates'
import { CbrFxClient } from './client'

const sampleXml = `<?xml version="1.0" encoding="windows-1251"?>
<ValCurs Date="18.08.2026" name="Foreign Currency Market">
  <Valute ID="R01239">
    <NumCode>978</NumCode>
    <CharCode>EUR</CharCode>
    <Nominal>1</Nominal>
    <Name>Euro</Name>
    <Value>100,0000</Value>
  </Valute>
</ValCurs>`

const repo = new IndexedDbFxRateRepository()

beforeEach(async () => {
  await db.fxRates.clear()
})

describe('ensureCbrRates', () => {
  it('stores CBR quotes for RUB crosses', async () => {
    const fetchFn = vi.fn(async () => new Response(sampleXml))
    const client = new CbrFxClient(fetchFn)
    const quotes = await ensureCbrRates(
      [{ from: 'RUB', to: 'EUR', date: '2026-08-18' }],
      repo,
      client,
    )
    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(lookupRate(quotes, 'RUB', 'EUR', '2026-08-18')).toBe(0.01)
  })
})
