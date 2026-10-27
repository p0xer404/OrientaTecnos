import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

export function EstatBuit({ titol, descripcio, accio }: { titol: string; descripcio?: string; accio?: ReactNode }) {
  return (
    <div className="fade-in flex flex-col items-center gap-3 rounded-lg border border-dashed border-line px-6 py-12 text-center">
      <p className="font-medium text-ink">{titol}</p>
      {descripcio && <p className="max-w-md text-sm text-muted">{descripcio}</p>}
      {accio}
    </div>
  )
}

export function EstatError({ missatge, onReintentar }: { missatge: string; onReintentar?: () => void }) {
  return (
    <div className="fade-in flex flex-col items-center gap-3 rounded-lg border border-warning/40 bg-warning-bg px-6 py-12 text-center">
      <p className="font-medium text-warning">No s'ha pogut carregar</p>
      <p className="max-w-md text-sm text-warning/90">{missatge}</p>
      {onReintentar && (
        <button
          onClick={onReintentar}
          className="rounded-md border border-warning px-4 py-1.5 text-sm font-medium text-warning transition-colors hover:bg-warning/10"
        >
          Torna-ho a provar
        </button>
      )}
    </div>
  )
}

const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Diàleg modal accessible: atrapa el focus a dins, bloqueja el scroll del fons, retorna el focus a
 * l'element que l'ha obert i entra i surt amb una animació curta (es manté muntat mentre surt).
 */
export function Modal({ obert, onTancar, titol, children }: { obert: boolean; onTancar: () => void; titol: string; children: ReactNode }) {
  const panellRef = useRef<HTMLDivElement>(null)
  // Ref perquè un onTancar nou a cada render del pare no torni a executar l'efecte: abans això
  // tornava a posar el focus al panell i el treia del camp on l'usuari estava escrivint.
  const onTancarRef = useRef(onTancar)
  useLayoutEffect(() => {
    onTancarRef.current = onTancar
  })
  const [muntat, setMuntat] = useState(obert)
  if (obert && !muntat) setMuntat(true)

  useEffect(() => {
    if (obert || !muntat) return
    const t = window.setTimeout(() => setMuntat(false), 180)
    return () => window.clearTimeout(t)
  }, [obert, muntat])

  useEffect(() => {
    if (!obert) return
    const anterior = document.activeElement as HTMLElement | null
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panellRef.current?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onTancarRef.current()
        return
      }
      if (e.key !== 'Tab' || !panellRef.current) return
      const elements = Array.from(panellRef.current.querySelectorAll<HTMLElement>(ENFOCABLES))
      if (elements.length === 0) return
      const primer = elements[0]
      const darrer = elements[elements.length - 1]
      if (e.shiftKey && (document.activeElement === primer || document.activeElement === panellRef.current)) {
        e.preventDefault()
        darrer.focus()
      } else if (!e.shiftKey && document.activeElement === darrer) {
        e.preventDefault()
        primer.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflowAnterior
      anterior?.focus?.()
    }
  }, [obert])

  if (!muntat) return null
  const estat = obert ? 'obert' : 'tancat'
  return (
    <div
      className="modal-fons fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-estat={estat}
      role="dialog"
      aria-modal="true"
      aria-label={titol}
      onClick={() => onTancarRef.current()}
    >
      <div
        ref={panellRef}
        tabIndex={-1}
        data-estat={estat}
        onClick={(e) => e.stopPropagation()}
        className="modal-panell max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-surface p-5 shadow-lg outline-none"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{titol}</h2>
          <button onClick={() => onTancarRef.current()} aria-label="Tancar" className="rounded-lg p-1 text-muted transition-colors hover:bg-canvas hover:text-ink">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function BannerDemo() {
  return (
    <div className="bg-warning-bg px-4 py-2 text-center text-xs font-medium text-warning">
      Mode demo: totes les dades d'alumnes, grups i resultats són fictícies i no corresponen a cap persona real.
    </div>
  )
}
