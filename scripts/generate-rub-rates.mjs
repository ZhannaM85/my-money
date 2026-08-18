import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { addDaysIso, fillForward, isoDatesInclusive } from './lib/cbrSeries.mjs'
import { nbgUrlForDate, quotesFromNbgPayload } from './lib/nbgSeries.mjs'

const TODAY = new Date().toISOString().slice(0, 10)
/** Keep CI bounded; older dates fill-forward from the first published quote. */
const START_DATE = addDaysIso(TODAY, -365 * 5)
const TARGET_CODES = [
  'EUR',
  'USD',
  'GBP',
  'CHF',
  'JPY',
  'CAD',
  'AUD',
  'PLN',
  'SEK',
  'NOK',
  'DKK',
  'CNY',
  'INR',
]
const CONCURRENCY = 12

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed ${response.status}: ${url}`)
  }
  return response.json()
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length)
  let next = 0
  async function run() {
    while (next < items.length) {
      const index = next
      next += 1
      results[index] = await worker(items[index], index)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => run()),
  )
  return results
}

async function main() {
  const outputDir = path.resolve('public/fx/rub')
  await mkdir(outputDir, { recursive: true })

  const dates = isoDatesInclusive(START_DATE, TODAY)
  console.log(
    `Fetching NBG rates for ${dates.length} days (${START_DATE}…${TODAY})`,
  )

  const dayQuotes = await mapPool(dates, CONCURRENCY, async (date) => {
    try {
      const payload = await fetchJson(nbgUrlForDate(date))
      return quotesFromNbgPayload(payload, date, TARGET_CODES)
    } catch (error) {
      console.warn(`NBG fetch failed for ${date}:`, error.message ?? error)
      return []
    }
  })

  const byCode = new Map(TARGET_CODES.map((code) => [code, []]))
  for (const quotes of dayQuotes) {
    for (const quote of quotes) {
      byCode.get(quote.base)?.push({ date: quote.date, rate: quote.rate })
    }
  }

  for (const code of TARGET_CODES) {
    const parsed = byCode.get(code) ?? []
    if (parsed.length === 0) {
      throw new Error(
        `NBG returned no quotes for ${code} from ${START_DATE} to ${TODAY}`,
      )
    }
    const filled = fillForward(parsed, START_DATE, TODAY)
    if (filled.length === 0) {
      throw new Error(`Filled RUB series for ${code} is empty`)
    }
    const output = {
      base: code,
      quote: 'RUB',
      source: 'NBG',
      quotes: filled,
    }
    await writeFile(
      path.join(outputDir, `${code}.json`),
      JSON.stringify(output),
      'utf8',
    )
    console.log(`Wrote ${code}.json with ${filled.length} quotes (NBG)`)
  }
}

await main()
