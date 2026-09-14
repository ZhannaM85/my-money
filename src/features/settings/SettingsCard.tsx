import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'

/** Meaning-grouped Settings chrome (#271 / #272). */
export function SettingsCard({
  title,
  description,
  children,
  className,
  contentClassName,
  testId,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
  contentClassName?: string
  testId?: string
}) {
  return (
    <Card className={className} data-testid={testId}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn('flex flex-col gap-4', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
