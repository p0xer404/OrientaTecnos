import { normalizeArtistic, normalizeBachillerato, normalizeFP, normalizeGrau } from './normalize'
import type { ArtisticSuperiorRaw, BachilleratoRaw, FPRaw, GrauRaw, MetaRaw, UniversitatRaw } from '../types/raw'
import type { Estudi, EstudiQualsevol } from '../types/estudi'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`No s'ha pogut carregar ${path} (${res.status})`)
  return res.json() as Promise<T>
}

function memoize<T>(loader: () => Promise<T>): () => Promise<T> {
  let promesa: Promise<T> | null = null
  return () => {
    if (!promesa) {
      promesa = loader().catch((err) => {
        promesa = null
        throw err
      })
    }
    return promesa
  }
}

export const getGrausRaw = memoize(() => fetchJson<GrauRaw[]>('/data/grados.json'))
export const getFPRaw = memoize(() => fetchJson<FPRaw[]>('/data/fp.json'))
export const getBachilleratosRaw = memoize(() => fetchJson<BachilleratoRaw[]>('/data/bachilleratos.json'))
export const getArtisticsRaw = memoize(() => fetchJson<ArtisticSuperiorRaw[]>('/data/artisticos_superiores.json'))
export const getUniversitats = memoize(() => fetchJson<UniversitatRaw[]>('/data/universidades.json'))
export const getMeta = memoize(() => fetchJson<MetaRaw>('/data/meta.json'))

export const getGraus = memoize(async (): Promise<Estudi<'grau'>[]> => (await getGrausRaw()).map(normalizeGrau))
export const getFP = memoize(async (): Promise<Estudi<'fp'>[]> => (await getFPRaw()).map(normalizeFP))
export const getBachilleratos = memoize(
  async (): Promise<Estudi<'batxillerat'>[]> => (await getBachilleratosRaw()).map(normalizeBachillerato),
)
export const getArtistics = memoize(
  async (): Promise<Estudi<'artistic'>[]> => (await getArtisticsRaw()).map(normalizeArtistic),
)

export const getTotsEstudis = memoize(async (): Promise<EstudiQualsevol[]> => {
  const [graus, fp, batx, art] = await Promise.all([getGraus(), getFP(), getBachilleratos(), getArtistics()])
  return [...graus, ...fp, ...batx, ...art]
})

export async function getEstudiPerId(id: string): Promise<EstudiQualsevol | undefined> {
  const tots = await getTotsEstudis()
  return tots.find((e) => e.id === id)
}
