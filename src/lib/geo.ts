// Coordenades de Terrassa (plaça Vella) per calcular distàncies amb fórmula de Haversine.
export const TERRASSA_COORDS = { lat: 41.5634, lon: 2.0111 }

/** Municipis del Vallès que CLAUDE.md indica com a referència de proximitat per als graus,
 * que no tenen coordenades a `data/grados.json`. */
export const MUNICIPIS_A_PROP_DE_TERRASSA = [
  'Terrassa',
  'Sabadell',
  'Sant Cugat del Vallès',
  'Cerdanyola del Vallès',
  'Barcelona',
]

export function esMunicipiAPropDeTerrassa(municipi: string): boolean {
  return MUNICIPIS_A_PROP_DE_TERRASSA.some((m) => m.toLowerCase() === municipi.trim().toLowerCase())
}

/** Distància en km entre dos punts (fórmula de Haversine). */
export function distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const sinLat = Math.sin(dLat / 2)
  const sinLon = Math.sin(dLon / 2)
  const a =
    sinLat * sinLat +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * sinLon * sinLon
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function distanciaATerrassa(lat: number | null, lon: number | null): number | null {
  if (lat == null || lon == null) return null
  return Math.round(distanciaKm(TERRASSA_COORDS.lat, TERRASSA_COORDS.lon, lat, lon) * 10) / 10
}

/** Per al botó "A prop de Terrassa" del cercador: fa servir km reals si n'hi ha
 * (FP, batxillerat, artístics) o la llista de municipis del Vallès si no n'hi ha (graus). */
export function estaAPropDeTerrassa(
  item: { municipi: string; kmTerrassa: number | null },
  kmMax = 20,
): boolean {
  if (item.kmTerrassa != null) return item.kmTerrassa <= kmMax
  return esMunicipiAPropDeTerrassa(item.municipi)
}
