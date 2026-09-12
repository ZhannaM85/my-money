import type { ReactNode } from 'react'

export function SettingsGroup({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  )
}
