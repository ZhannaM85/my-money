import { PageHeader } from '@/shared/ui/page-header'
import { EmptyState } from '@/shared/ui/empty-state'

export function PlaceholderScreen({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} />
      <EmptyState title="Coming next" description={description} />
    </div>
  )
}
