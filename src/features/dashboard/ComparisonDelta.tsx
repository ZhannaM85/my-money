import { ArrowDown, ArrowUp } from 'lucide-react'
import { useLocale, useTranslation } from '@/i18n'
import { formatSignedAmount } from '@/shared/lib/money'

export function ComparisonDelta({
  delta,
  currency,
}: {
  delta: number | null
  currency: string
}) {
  const t = useTranslation()
  const locale = useLocale()
  if (delta === null) return null
  const up = delta > 0
  const Icon = up ? ArrowUp : ArrowDown
  const amount = formatSignedAmount(delta, currency, locale)
  return (
    <span
      className={
        up
          ? 'inline-flex items-center justify-end gap-0.5 text-xs tabular-nums text-[var(--chart-investments)]'
          : 'inline-flex items-center justify-end gap-0.5 text-xs tabular-nums text-destructive'
      }
      data-testid="comparison-delta"
      data-direction={up ? 'up' : 'down'}
      aria-label={
        up
          ? t.dashboard.comparisonIncreased(amount)
          : t.dashboard.comparisonDecreased(amount)
      }
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {amount}
    </span>
  )
}
