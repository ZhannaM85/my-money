import type * as React from 'react'
import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/ui/card'

export interface StatCardProps {
  label: string
  value: React.ReactNode
  unit?: string
  description?: string
  className?: string
}

export function StatCard({
  label,
  value,
  unit,
  description,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('overflow-visible', className)}>
      <CardContent className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-4xl font-semibold tabular-nums text-foreground">
            {value}
          </span>
          {unit && (
            <span className="text-lg text-muted-foreground">{unit}</span>
          )}
        </span>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </CardContent>
    </Card>
  )
}
