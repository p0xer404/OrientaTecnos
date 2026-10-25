import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onRemove?: () => void
}

/** Xip de filtre actiu (com a Stuveo), ex: "Barcelona ✕". */
export function Chip({ children, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-info-bg px-3 py-1 text-xs font-medium text-primary">
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={typeof children === 'string' ? `Treure el filtre «${children}»` : 'Treure filtre'}
          className="rounded-full p-0.5 hover:bg-primary/20"
        >
          ✕
        </button>
      )}
    </span>
  )
}
