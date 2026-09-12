import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { ChartRangePicker } from './ChartRangePicker'
import { ChartRangeToolbar } from './ChartRangeToolbar'
import type { ChartRangeController } from './useChartRange'

/** Chips, custom dates, zoom, and optional pan — one chrome for every chart (#239). */
export function ChartRangeControls({
  range,
  earliest,
  latest,
  showPicker = true,
  showToolbar = true,
  showPan = false,
  children,
}: {
  range: ChartRangeController
  earliest: string
  latest: string
  showPicker?: boolean
  showToolbar?: boolean
  showPan?: boolean
  children?: ReactNode
}) {
  const t = useTranslation()

  return (
    <>
      {showPicker ? (
        <ChartRangePicker
          range={range.range}
          onRangeChange={range.selectRange}
          customStart={range.customStart}
          customEnd={range.customEnd}
          onCustomStartChange={range.onCustomStartChange}
          onCustomEndChange={range.onCustomEndChange}
          earliest={earliest}
          latest={latest}
        />
      ) : null}
      {children}
      {showToolbar ? (
        <ChartRangeToolbar rangeLabel={range.rangeLabel}>
          {showPan ? (
            <>
              <Button
                type="button"
                variant="muted"
                size="icon-compact"
                disabled={!range.canPanEarlier}
                aria-label={t.dashboard.panEarlier}
                onClick={range.panEarlier}
              >
                <ChevronLeft className="size-5" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="muted"
                size="icon-compact"
                disabled={!range.canPanLater}
                aria-label={t.dashboard.panLater}
                onClick={range.panLater}
              >
                <ChevronRight className="size-5" aria-hidden />
              </Button>
            </>
          ) : null}
          <Chip
            disabled={!range.canZoomIn}
            onClick={() => {
              if (!range.canZoomIn) return
              range.zoomIn()
            }}
          >
            {t.dashboard.zoomIn}
          </Chip>
          <Chip
            disabled={!range.canZoomOut}
            onClick={() => {
              if (!range.canZoomOut) return
              range.zoomOut()
            }}
          >
            {t.dashboard.zoomOut}
          </Chip>
        </ChartRangeToolbar>
      ) : null}
    </>
  )
}
