import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fillForward, parseSeries } from './lib/cbrSeries.mjs'

const CBR_CURRENCIES_URL = 'https://www.cbr.ru/scripts/XML_valFull.asp'
const CBR_DYNAMIC_URL = 'https://www.cbr.ru/scripts/XML_dynamic.asp'
const START_DATE = '1999-01-01'
const TODAY = new Date().toISOString().slice(0, 10)
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

function isoToCbrDate(iso) {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

function parseCurrencyIds(xml) {
  const ids = new Map()
  const itemRegex =
    /<Item\s+ID="([^"]+)">[\s\S]*?<ISO_Char_Code>([^<]+)<\/ISO_Char_Code>[\s\S]*?<\/Item>/g
  for (const match of xml.matchAll(itemRegex)) {
    ids.set(match[2].trim(), match[1].trim())
  }
  return ids
}

async function fetchText(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed ${response.status}: ${url}`)
  }
  return response.text()
}

async function main() {
  const outputDir = path.resolve('public/fx/rub')
  await mkdir(outputDir, { recursive: true })

  const idsXml = await fetchText(CBR_CURRENCIES_URL)
  const currencyIds = parseCurrencyIds(idsXml)

  for (const code of TARGET_CODES) {
    const id = currencyIds.get(code)
    if (!id) {
      throw new Error(`No CBR currency ID found for ${code}`)
    }
    const url = new URL(CBR_DYNAMIC_URL)
    url.searchParams.set('date_req1', isoToCbrDate(START_DATE))
    url.searchParams.set('date_req2', isoToCbrDate(TODAY))
    url.searchParams.set('VAL_NM_RQ', id)
    const seriesXml = await fetchText(url.toString())
    const parsed = parseSeries(seriesXml)
    if (parsed.length === 0) {
      throw new Error(
        `CBR returned no quotes for ${code} (${id}) from ${START_DATE} to ${TODAY}`,
      )
    }
    const filled = fillForward(parsed, START_DATE, TODAY)
    if (filled.length === 0) {
      throw new Error(`Filled RUB series for ${code} is empty`)
    }
    const output = {
      base: code,
      quote: 'RUB',
      quotes: filled,
    }
    await writeFile(
      path.join(outputDir, `${code}.json`),
      JSON.stringify(output),
      'utf8',
    )
    console.log(`Wrote ${code}.json with ${filled.length} quotes`)
  }
}

await main()
