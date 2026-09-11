/** Shared form-control Tailwind classes backed by `--control-height` (#232). */
export const controlHeightClass = 'h-control'
export const controlHeightCompactClass = 'h-control-compact'
export const controlUnitPadClass = 'pr-12'

export const controlFieldChromeClass =
  'w-full min-w-0 rounded-lg border border-input bg-background px-control-x text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive'

/** Native text / date / number / select chrome matching Button `default` / `xl`. */
export const controlFieldClass = `${controlHeightClass} ${controlFieldChromeClass}`
