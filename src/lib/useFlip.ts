import { useLayoutEffect, useRef, type RefObject } from 'react'

/**
 * Animació FLIP per a llistes que canvien d'ordre: cada fill amb `data-flip="<id>"` llisca des
 * de la seva posició anterior fins a la nova en lloc de saltar-hi de cop. `clau` ha de canviar
 * quan canvia l'ordre (p. ex. els ids units). No fa res amb "reduir moviment" activat.
 */
export function useFlip(contenidor: RefObject<HTMLElement | null>, clau: string) {
  const posicions = useRef(new Map<string, DOMRect>())

  useLayoutEffect(() => {
    const el = contenidor.current
    if (!el) return
    const fills = Array.from(el.querySelectorAll<HTMLElement>('[data-flip]'))
    const reduir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const noves = new Map<string, DOMRect>()
    for (const fill of fills) {
      const id = fill.dataset.flip!
      const ara = fill.getBoundingClientRect()
      noves.set(id, ara)
      const abans = posicions.current.get(id)
      if (reduir || !abans || typeof fill.animate !== 'function') continue
      const dy = abans.top - ara.top
      const dx = abans.left - ara.left
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue
      fill.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
        duration: 260,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      })
    }
    posicions.current = noves
  }, [contenidor, clau])
}
