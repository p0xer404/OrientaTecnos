import type { ReactNode } from 'react'

type ToPus = 'neutral' | 'success' | 'warning' | 'info' | 'accent'

const ESTILS: Record<ToPus, string> = {
  neutral: 'bg-canvas text-muted border border-line',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  info: 'bg-info-bg text-primary',
  accent: 'bg-accent/15 text-accent',
}

export function Badge({ tipus = 'neutral', children }: { tipus?: ToPus; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium tracking-wide ${ESTILS[tipus]}`}>
      {children}
    </span>
  )
}
