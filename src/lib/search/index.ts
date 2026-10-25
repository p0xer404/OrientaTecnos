import Fuse from 'fuse.js'
import type { EstudiQualsevol } from '../../types/estudi'

export function crearCercador(estudis: EstudiQualsevol[]): Fuse<EstudiQualsevol> {
  return new Fuse(estudis, {
    keys: [
      { name: 'nom', weight: 0.5 },
      { name: 'centre', weight: 0.25 },
      { name: 'municipi', weight: 0.15 },
      { name: 'area', weight: 0.1 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 2,
  })
}

export function cercarEstudis(cercador: Fuse<EstudiQualsevol>, text: string): EstudiQualsevol[] {
  if (!text.trim()) return []
  return cercador.search(text).map((r) => r.item)
}
