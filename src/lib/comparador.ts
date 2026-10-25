import { useEffect, useState } from 'react'

const CLAU = 'buscador-tecnos-comparador'
export const MAX_COMPARADOR = 4

export interface ReferenciaComparador {
  id: string
  tipus: string
}

function llegir(): ReferenciaComparador[] {
  try {
    const text = localStorage.getItem(CLAU)
    const valor: unknown = text ? JSON.parse(text) : []
    return Array.isArray(valor) ? valor.filter((i) => i && typeof i.id === 'string') : []
  } catch {
    return []
  }
}

function desar(items: ReferenciaComparador[]): void {
  try {
    localStorage.setItem(CLAU, JSON.stringify(items))
  } catch {
    // ignorat
  }
  window.dispatchEvent(new CustomEvent('comparador-canvi'))
}

export function obtenirComparador(): ReferenciaComparador[] {
  return llegir()
}

export function afegirAlComparador(id: string, tipus: string): { ok: boolean; motiu?: string } {
  const actuals = llegir()
  if (actuals.some((i) => i.id === id)) return { ok: true }
  if (actuals.length >= MAX_COMPARADOR) return { ok: false, motiu: `Només pots comparar fins a ${MAX_COMPARADOR} estudis alhora.` }
  desar([...actuals, { id, tipus }])
  return { ok: true }
}

export function treureDelComparador(id: string): void {
  desar(llegir().filter((i) => i.id !== id))
}

export function buidarComparador(): void {
  desar([])
}

/** Es manté sincronitzat amb el comparador (localStorage) a qualsevol pàgina,
 * perquè els botons "+ Comparar" i la barra flotant reflecteixin sempre l'estat real. */
export function useComparador(): ReferenciaComparador[] {
  const [items, setItems] = useState<ReferenciaComparador[]>(() => obtenirComparador())

  useEffect(() => {
    const actualitza = () => setItems(obtenirComparador())
    const actualitzaDesDAltraPestanya = (e: StorageEvent) => {
      if (e.key === CLAU) actualitza()
    }
    window.addEventListener('comparador-canvi', actualitza)
    window.addEventListener('storage', actualitzaDesDAltraPestanya)
    return () => {
      window.removeEventListener('comparador-canvi', actualitza)
      window.removeEventListener('storage', actualitzaDesDAltraPestanya)
    }
  }, [])

  return items
}
