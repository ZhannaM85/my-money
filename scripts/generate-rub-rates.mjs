import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

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

function parseCbrNumber(raw) {
  return Number(raw.trim().replace(',', '.'))
}

function isoToCbrDate(iso) {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

function cbrToIsoDate(raw) {
  const [day, month, year] = raw.split('.')
  return `${year}-${month}-${day}`
}

function addDaysIso(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function isoDatesInclusive(from, to) {
  if (from > to) return []
  const dates = []
  let current = from
  while (current <= to) {
    dates.push(current)
    current = addDaysIso(current, 1)
  }
  return dates
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

function parseSeries(xml) {
  const rows = []
  const recordRegex = /<Record\s+Date="([^"]+)">([\s\S]*?)<\/Record>/g
  for (const match of xml.matchAll(recordRegex)) {
    const date = cbrToIsoDate(match[1].trim())
    const body = match[2]
    const nominalRaw = body.match(/<Nominal>([^<]+)<\/Nominal>/)?.[1]
    const valueRaw = body.match(/<Value>([^<]+)<\/Value>/)?.[1]
    if (!nominalRaw || !valueRaw) continue
    const nominal = parseCbrNumber(nominalRaw)
    const value = parseCbrNumber(valueRaw)
    if (!Number.isFinite(nominal) || !Number.isFinite(value) || nominal === 0) {
      continue
    }
    rows.push({ date, rate: value / nominal })
  }
  rows.sort((a, b) => a.date.localeCompare(b.date))
  return rows
}

function fillForward(quotes, start, end) {
  const byDate = new Map(quotes.map((quote) => [quote.date, quote.rate]))
  const filled = []
  let lastRate
  for (const date of isoDatesInclusive(start, end)) {
    const current = byDate.get(date)
    if (current !== undefined) lastRate = current
    if (lastRate !== undefined) {
      filled.push({ date, rate: lastRate })
    }
  }
  return filled
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
    const filled = fillForward(parseSeries(seriesXml), START_DATE, TODAY)
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
  }
}

await main()
