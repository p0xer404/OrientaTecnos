import { useEffect, useRef, type ReactNode } from 'react'

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

export function Modal({ obert, onTancar, titol, children }: { obert: boolean; onTancar: () => void; titol: string; children: ReactNode }) {
  const panellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!obert) return
    panellRef.current?.focus()
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onTancar()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [obert, onTancar])

  if (!obert) return null
  return (
    <div
      className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={titol}
      onClick={onTancar}
    >
      <div
        ref={panellRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-surface p-5 shadow-lg outline-none"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{titol}</h2>
          <button onClick={onTancar} aria-label="Tancar" className="rounded-lg p-1 text-muted hover:bg-canvas">
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
