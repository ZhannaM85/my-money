import { Link } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { SettingsCard } from './SettingsCard'

/** Comparison + Allocation entry points as one tools card (#272). */
export function ToolsSection() {
  const t = useTranslation()

  return (
    <SettingsCard
      testId="settings-tools"
      title={t.settings.toolsTitle}
      description={t.settings.toolsDescription}
    >
      <Button asChild variant="outline" className="w-full">
        <Link to="/compare">{t.settings.comparison}</Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link to="/allocation">{t.settings.allocation}</Link>
      </Button>
    </SettingsCard>
  )
}
