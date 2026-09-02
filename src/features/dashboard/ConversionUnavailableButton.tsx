import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import {
  fxDebug,
  getFxRuntimeContext,
  setFxDebugEnabled,
} from '@/infrastructure/fx/fxDebug'

export function ConversionUnavailableButton({
  from,
  to,
  date,
  assetId,
}: {
  from: string
  to: string
  date?: string
  assetId?: string
}) {
  const t = useTranslation()
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className="text-left text-xs text-muted-foreground underline-offset-2 hover:underline"
      data-testid="conversion-unavailable"
      onClick={(event) => {
        event.stopPropagation()
        setFxDebugEnabled(true)
        fxDebug('conversion unavailable', {
          from,
          to,
          date,
          assetId,
          ...getFxRuntimeContext(),
        })
        navigate({ pathname: '/settings', hash: 'fx-debug' })
      }}
    >
      {t.dashboard.conversionUnavailable}
    </button>
  )
}
