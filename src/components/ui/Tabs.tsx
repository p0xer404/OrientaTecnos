import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'

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
  const contenidorRef = useRef<HTMLDivElement>(null)
  // Clau estable: hi ha pàgines que passen l'array de pestanyes creat de nou a cada render.
  const claus = pestanyes.map((p) => p.id).join('|')
  // Posició del fons de la pestanya activa: llisca d'una pestanya a l'altra en lloc d'aparèixer de cop.
  const [indicador, setIndicador] = useState<{ left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    const contenidor = contenidorRef.current
    if (!contenidor) return
    function mesurar() {
      const boto = contenidor!.querySelector<HTMLElement>(`[data-tab="${CSS.escape(activa)}"]`)
      if (!boto) return
      const left = boto.offsetLeft
      const width = boto.offsetWidth
      setIndicador((anterior) => (anterior && anterior.left === left && anterior.width === width ? anterior : { left, width }))
      // Al mòbil la barra fa scroll horitzontal: es porta la pestanya activa a la vista.
      const marge = 16
      if (boto.offsetLeft < contenidor!.scrollLeft) contenidor!.scrollTo({ left: boto.offsetLeft - marge, behavior: 'smooth' })
      else if (boto.offsetLeft + boto.offsetWidth > contenidor!.scrollLeft + contenidor!.clientWidth)
        contenidor!.scrollTo({ left: boto.offsetLeft + boto.offsetWidth - contenidor!.clientWidth + marge, behavior: 'smooth' })
    }
    mesurar()
    if (typeof ResizeObserver === 'undefined') return
    const observador = new ResizeObserver(mesurar)
    observador.observe(contenidor)
    return () => observador.disconnect()
  }, [activa, claus])

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
    <div ref={contenidorRef} role="tablist" className="relative flex gap-1 overflow-x-auto rounded-md bg-canvas p-1">
      {indicador && (
        <span
          aria-hidden="true"
          className="absolute bottom-1 top-1 rounded bg-surface shadow-sm transition-[left,width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
          style={{ left: indicador.left, width: indicador.width }}
        />
      )}
      {pestanyes.map((p, i) => (
        <button
          key={p.id}
          id={`tab-${p.id}`}
          data-tab={p.id}
          role="tab"
          aria-selected={p.id === activa}
          tabIndex={p.id === activa ? 0 : -1}
          onClick={() => onCanvia(p.id)}
          onKeyDown={(e) => onKeyDown(e, i)}
          className={`relative z-10 whitespace-nowrap rounded px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            p.id === activa ? `text-primary ${indicador ? '' : 'bg-surface shadow-sm'}` : 'text-muted hover:text-ink'
          }`}
        >
          {p.etiqueta}
          {p.comptador != null && <span className="ml-1.5 text-xs text-muted">({p.comptador})</span>}
        </button>
      ))}
    </div>
  )
}
