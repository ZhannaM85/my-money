import { BackupSection, CsvSection } from '@/features/export'
import { useTranslation } from '@/i18n'
import { SettingsCard } from './SettingsCard'

/** Backup + CSV in one Data meaning card (#272). */
export function DataSection() {
  const t = useTranslation()

  return (
    <SettingsCard
      testId="settings-data"
      title={t.settings.groupData}
      description={t.settings.dataDescription}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-foreground">{t.backup.title}</h3>
          <p className="text-sm text-muted-foreground">{t.backup.description}</p>
        </div>
        <BackupSection embedded />
      </div>
      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-foreground">{t.csv.title}</h3>
          <p className="text-sm text-muted-foreground">{t.csv.description}</p>
        </div>
        <CsvSection embedded />
      </div>
    </SettingsCard>
  )
}
