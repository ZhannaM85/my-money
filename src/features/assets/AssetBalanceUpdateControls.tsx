import type { BalanceEntryMode, BalanceHeadline } from '@/domain/asset'
import type { Locale } from '@/domain/settings'
import { useTranslation } from '@/i18n'
import { formatAmount } from '@/shared/lib/money'
import { Chip } from '@/shared/ui/chip'
import { MoneyInput } from '@/shared/ui/money-input'

export function BalanceHeadlineToggles({
  headline,
  onHeadlineChange,
}: {
  headline: BalanceHeadline
  onHeadlineChange: (headline: BalanceHeadline) => void
}) {
  const t = useTranslation()
  return (
    <div
      className="flex flex-wrap gap-2"
      data-testid="balance-headline-toggles"
    >
      <Chip
        pressed={headline === 'remaining'}
        onClick={() => onHeadlineChange('remaining')}
      >
        {t.asset.headlineRemaining}
      </Chip>
      <Chip
        pressed={headline === 'given_spent'}
        onClick={() => onHeadlineChange('given_spent')}
      >
        {t.asset.headlineGivenSpent}
      </Chip>
    </div>
  )
}

export function AssetBalanceUpdateControls({
  amountAriaLabel,
  locale,
  currency,
  headline,
  onHeadlineChange,
  entryMode,
  onEntryModeChange,
  draft,
  onDraftChange,
  placeholder,
  resultingRemaining,
}: {
  amountAriaLabel: string
  locale: Locale
  currency: string
  headline: BalanceHeadline
  onHeadlineChange: (headline: BalanceHeadline) => void
  entryMode: BalanceEntryMode
  onEntryModeChange: (mode: BalanceEntryMode) => void
  draft: string
  onDraftChange: (value: string) => void
  placeholder?: string
  resultingRemaining?: number
}) {
  const t = useTranslation()

  function setMode(mode: BalanceEntryMode) {
    if (mode === entryMode) return
    onDraftChange('')
    onEntryModeChange(mode)
  }

  return (
    <div
      className="flex min-w-0 flex-col gap-2"
      data-testid="asset-balance-update"
    >
      <BalanceHeadlineToggles
        headline={headline}
        onHeadlineChange={onHeadlineChange}
      />
      <div className="flex flex-wrap gap-2" data-testid="balance-entry-toggles">
        <Chip
          pressed={entryMode === 'new_balance'}
          onClick={() => setMode('new_balance')}
        >
          {t.asset.entryNewBalance}
        </Chip>
        <Chip
          pressed={entryMode === 'add'}
          aria-label={t.asset.entryAdded}
          onClick={() => setMode('add')}
        >
          +
        </Chip>
        <Chip
          pressed={entryMode === 'remove'}
          aria-label={t.asset.entryRemoved}
          onClick={() => setMode('remove')}
        >
          −
        </Chip>
      </div>
      <MoneyInput
        aria-label={amountAriaLabel}
        locale={locale}
        currency={currency}
        value={draft}
        onValueChange={onDraftChange}
        placeholder={placeholder}
      />
      {entryMode !== 'new_balance' && resultingRemaining !== undefined ? (
        <p
          className="text-xs text-muted-foreground"
          data-testid="resulting-remaining"
        >
          {t.asset.resultingRemaining(
            formatAmount(resultingRemaining, currency, locale),
          )}
        </p>
      ) : null}
    </div>
  )
}
