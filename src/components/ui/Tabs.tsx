import type { KeyboardEvent } from 'react'

interface Pestanya {
  id: string
  etiqueta: string
  comptador?: number
}

interface Props {
  pestanyes: Pestanya[]
  activa: string
  onCanvia: (id: string) => void
}

export function Tabs({ pestanyes, activa, onCanvia }: Props) {
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const seguent =
      e.key === 'Home' ? 0 : e.key === 'End' ? pestanyes.length - 1 : e.key === 'ArrowRight' ? (index + 1) % pestanyes.length : (index - 1 + pestanyes.length) % pestanyes.length
    onCanvia(pestanyes[seguent].id)
    const boto = document.getElementById(`tab-${pestanyes[seguent].id}`)
    boto?.focus()
  }

  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto rounded-md bg-canvas p-1">
      {pestanyes.map((p, i) => (
        <button
          key={p.id}
          id={`tab-${p.id}`}
          role="tab"
          aria-selected={p.id === activa}
          tabIndex={p.id === activa ? 0 : -1}
          onClick={() => onCanvia(p.id)}
          onKeyDown={(e) => onKeyDown(e, i)}
          className={`whitespace-nowrap rounded transition-[background-color,color,box-shadow] duration-150 px-3 py-2 text-sm font-medium ${
            p.id === activa ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-ink'
          }`}
        >
          {p.etiqueta}
          {p.comptador != null && <span className="ml-1.5 text-xs text-muted">({p.comptador})</span>}
        </button>
      ))}
    </div>
  )
}
