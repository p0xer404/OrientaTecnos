import type { ArtisticSuperiorRaw, BachilleratoRaw, FPRaw, GrauRaw } from './raw'

export type EstudiTipus = 'grau' | 'fp' | 'batxillerat' | 'artistic'

export type RawPerTipus = {
  grau: GrauRaw
  fp: FPRaw
  batxillerat: BachilleratoRaw
  artistic: ArtisticSuperiorRaw
}

/** Vista unificada d'un estudi (grau, FP, batxillerat o ensenyament artístic) per al cercador,
 * el comparador i les llistes. `raw` conserva totes les dades originals del fitxer font. */
export interface Estudi<T extends EstudiTipus = EstudiTipus> {
  id: string
  tipus: T
  nom: string
  subtitol: string
  centre: string
  municipi: string
  comarca: string | null
  titularitat: string
  lat: number | null
  lon: number | null
  kmTerrassa: number | null
  esTerrassa: boolean
  preu: number | null
  preuRef: string | null
  preuNota: string | null
  notaTall2026: number | null
  places: number | null
  area: string
  destacat: boolean
  raw: RawPerTipus[T]
}

/** Unió discriminada real (no una sola instanciació genèrica), perquè TypeScript pugui
 * estrènyer `raw` quan es comprova `estudi.tipus === 'grau'`, etc. */
export type EstudiQualsevol = { [T in EstudiTipus]: Estudi<T> }[EstudiTipus]
