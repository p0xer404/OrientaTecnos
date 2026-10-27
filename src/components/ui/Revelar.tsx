import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Fa aparèixer el contingut amb un fos i un petit desplaçament quan entra a la pantalla en fer scroll. */
export function Revelar({ children, className = '', retard = 0 }: { children: ReactNode; className?: string; retard?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  // Sense IntersectionObserver (navegadors molt antics) es mostra directament.
  const [vist, setVist] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || vist) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada?.isIntersecting) {
          setVist(true)
          observador.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    observador.observe(el)
    // Xarxa de seguretat: si l'observador no avisa mai (pestanya en segon pla, navegadors
    // estranys), el contingut no es pot quedar invisible per sempre.
    const seguretat = window.setTimeout(() => setVist(true), 2500)
    return () => {
      observador.disconnect()
      window.clearTimeout(seguretat)
    }
  }, [vist])

  return (
    <div ref={ref} className={`revelar ${vist ? 'revelat' : ''} ${className}`} style={retard ? { transitionDelay: `${retard}ms` } : undefined}>
      {children}
    </div>
  )
}
