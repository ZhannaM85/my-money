import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import { cn } from '@/shared/lib/utils'
import { FxDebugSection } from './FxDebugSection'
import { RcaSection } from './RcaSection'

const DEVELOPER_HASHES = new Set(['#fx-debug', '#root-causes'])

function hashOpensDeveloper(hash: string): boolean {
  return DEVELOPER_HASHES.has(hash)
}

export function DeveloperSection() {
  const t = useTranslation()
  const { hash } = useLocation()
  const hashOpen = hashOpensDeveloper(hash)
  const [userOpen, setUserOpen] = useState(false)
  const open = hashOpen || userOpen

  useEffect(() => {
    if (!hashOpensDeveloper(hash)) return
    const id = hash.slice(1)
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView?.({ block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [hash])

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-left"
          aria-expanded={open}
          onClick={() => setUserOpen(!open)}
        >
          {t.settings.groupDeveloper}
          <ChevronDown
            className={cn(
              'size-5 shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </button>
      </h2>
      {open ? (
        <>
          <FxDebugSection />
          <section id="root-causes" className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">{t.settings.rcaLabel}</h3>
              <p className="text-sm text-muted-foreground">
                {t.settings.rcaDescription}
              </p>
            </div>
            <RcaSection />
          </section>
        </>
      ) : null}
    </section>
  )
}
