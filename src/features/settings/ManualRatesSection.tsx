import { useEffect, useMemo, useState } from 'react'
import { BASE_CURRENCIES } from '@/domain/settings'
import { lookupRate } from '@/domain/fx'
import { useLocale, useTranslation } from '@/i18n'
import { parseAmount, todayIsoDate } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { MoneyInput } from '@/shared/ui/money-input'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'

export function ManualRatesSection() {
  const t = useTranslation()
  const locale = useLocale()
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const assets = useAssetStore((state) => state.assets)
  const loadAssets = useAssetStore((state) => state.load)
  const loadCached = useFxStore((state) => state.loadCached)
  const manualQuotes = useFxStore((state) => state.manualQuotes)
  const quotes = useFxStore((state) => state.quotes)
  const saveManualRates = useFxStore((state) => state.saveManualRates)
  const clearManualRatesForDate = useFxStore(
    (state) => state.clearManualRatesForDate,
  )
  const [open, setOpen] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const today = todayIsoDate()

  useEffect(() => {
    void loadAssets()
    void loadCached()
  }, [loadAssets, loadCached])

  const foreignCodes = useMemo(() => {
    const fromAssets = assets.map((asset) => asset.currency)
    return [
      ...new Set([...fromAssets, ...BASE_CURRENCIES].filter(
        (code) => code !== baseCurrency,
      )),
    ].sort()
  }, [assets, baseCurrency])

  const todayManualCount = manualQuotes.filter(
    (quote) => quote.date === today,
  ).length

  function seedDrafts() {
    const next: Record<string, string> = {}
    for (const code of foreignCodes) {
      const manual = lookupRate(manualQuotes, baseCurrency, code, today)
      const system = lookupRate(quotes, baseCurrency, code, today)
      const rate = manual ?? system
      next[code] = rate !== undefined ? String(rate) : ''
    }
    setDrafts(next)
    setSaved(false)
  }

  async function handleSave() {
    const quotesToSave = foreignCodes.flatMap((code) => {
      const parsed = parseAmount(drafts[code] ?? '')
      if (parsed === undefined || parsed <= 0) return []
      return [
        {
          date: today,
          base: baseCurrency,
          quote: code,
          rate: parsed,
        },
      ]
    })
    await clearManualRatesForDate(today)
    if (quotesToSave.length > 0) {
      await saveManualRates(quotesToSave)
    }
    setSaved(true)
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{t.settings.manualRatesTitle}</h2>
        <p className="text-sm text-muted-foreground">
          {t.settings.manualRatesDescription}
        </p>
        {todayManualCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {t.settings.manualRatesActive(todayManualCount, today)}
          </p>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          if (!open) seedDrafts()
          setOpen((value) => !value)
        }}
      >
        {open ? t.settings.manualRatesHide : t.settings.manualRatesEdit}
      </Button>      {open && (
        <div className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">
            {t.settings.manualRatesHint(today)}
          </p>
          <ul className="flex flex-col gap-3">
            {foreignCodes.map((code) => (
              <li key={code}>
                <MoneyInput
                  label={t.settings.manualRatesPair(baseCurrency, code)}
                  locale={locale}
                  currency={code}
                  value={drafts[code] ?? ''}
                  onValueChange={(value) =>
                    setDrafts((current) => ({ ...current, [code]: value }))
                  }
                />
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void handleSave()}>
              {t.settings.manualRatesSave}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void clearManualRatesForDate(today).then(() => {
                  setDrafts({})
                  setSaved(false)
                })
              }}
            >
              {t.settings.manualRatesClear}
            </Button>
          </div>
          {saved && (
            <p className="text-sm text-muted-foreground">
              {t.settings.manualRatesSaved}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
