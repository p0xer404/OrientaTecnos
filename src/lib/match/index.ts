import { afinitatRiasec, categoriaDominant, dominantsDesDInteressos, NOM_PERFIL } from '../riasec/mapping'
import { formatDecimal, formatKm } from '../format'
import type { PerfilRiasec, ResultatPreferencies } from '../../types/domain'
import type { EstudiQualsevol } from '../../types/estudi'

export interface EntradaMatch {
  notaMitjana: number | null
  /** Perfils dominants del test RIASEC (buit si encara no l'ha fet). */
  dominants: PerfilRiasec[]
  preferencies: ResultatPreferencies | null
  /** Àrees d'interès de l'onboarding/perfil: s'usen si no hi ha test RIASEC. */
  interessos?: string[]
}

/** La nota mitjana és sobre 10 (ESO/Batxillerat) i la nota de tall sobre 14 (fase general
 * + fase específica). Per poder-les comparar s'estima la nota d'admissió suposant el mateix
 * rendiment a la fase específica: és una aproximació, i així s'explica a l'alumne. */
export function notaAdmissioEstimada(notaMitjana: number): number {
  return Math.min(14, Math.round(notaMitjana * 1.4 * 1000) / 1000)
}

export interface ResultatMatch {
  puntuacio: number
  etiqueta: 'Match' | 'Bona opció' | 'Possible' | 'Poc afí'
  explicacio: string
  parcials: {
    riasec: number
    nota: number | null
    pressupost: number
    distancia: number
    preferencies: number
  }
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n))
}

function puntuacioNota(estudi: EstudiQualsevol, notaMitjana: number | null): number | null {
  if (estudi.notaTall2026 == null || notaMitjana == null) return null
  const diferencia = notaAdmissioEstimada(notaMitjana) - estudi.notaTall2026
  return Math.round(clamp(50 + diferencia * 25))
}

function puntuacioPressupost(estudi: EstudiQualsevol, pressupostMax: number): number {
  if (estudi.preu == null) return 70
  if (estudi.preu <= pressupostMax) return 100
  const excedent = (estudi.preu - pressupostMax) / pressupostMax
  return Math.round(clamp(100 - excedent * 100))
}

function puntuacioDistancia(estudi: EstudiQualsevol, disposatDesplacarKm: number): number {
  if (estudi.kmTerrassa == null) return 70
  if (estudi.kmTerrassa <= disposatDesplacarKm) return 100
  const excedent = estudi.kmTerrassa - disposatDesplacarKm
  return Math.round(clamp(100 - excedent * 2))
}

function esPrivat(titularitat: string): boolean {
  return titularitat.toLowerCase().startsWith('privad') || titularitat.toLowerCase().startsWith('privat')
}

function esPublic(titularitat: string): boolean {
  return titularitat.toLowerCase().startsWith('públic') || titularitat.toLowerCase().startsWith('pública')
}

function teIdiomaEstranger(estudi: EstudiQualsevol): boolean {
  if (estudi.tipus !== 'grau') return false
  const idiomes = estudi.raw.idiomas?.toLowerCase() ?? ''
  return idiomes.includes('anglès') || idiomes.includes('english') || idiomes.includes('francès')
}

function puntuacioTipusEstudi(estudi: EstudiQualsevol, universitatVsFp: number): number {
  const esUniversitari = estudi.tipus === 'grau' || estudi.tipus === 'artistic'
  if (estudi.tipus === 'batxillerat') return 70
  if (universitatVsFp >= 60) return esUniversitari ? 100 : 40
  if (universitatVsFp <= 40) return esUniversitari ? 40 : 100
  return 70
}

function puntuacioPreferencies(estudi: EstudiQualsevol, preferencies: ResultatPreferencies): number {
  let puntsTitularitat = 60
  if (preferencies.publicVsPrivat >= 60 && esPrivat(estudi.titularitat)) puntsTitularitat = 100
  else if (preferencies.publicVsPrivat <= 40 && esPublic(estudi.titularitat)) puntsTitularitat = 100
  else if (preferencies.publicVsPrivat >= 60 && esPublic(estudi.titularitat)) puntsTitularitat = 35
  else if (preferencies.publicVsPrivat <= 40 && esPrivat(estudi.titularitat)) puntsTitularitat = 35

  let puntsIdioma = 70
  if (preferencies.importanciaIdioma >= 60) puntsIdioma = teIdiomaEstranger(estudi) ? 100 : 50

  const puntsTipus = puntuacioTipusEstudi(estudi, preferencies.universitatVsFp)

  return Math.round((puntsTitularitat + puntsIdioma + puntsTipus * 2) / 4)
}

function etiquetaDe(puntuacio: number): ResultatMatch['etiqueta'] {
  if (puntuacio >= 80) return 'Match'
  if (puntuacio >= 60) return 'Bona opció'
  if (puntuacio >= 40) return 'Possible'
  return 'Poc afí'
}

function generarExplicacio(
  estudi: EstudiQualsevol,
  entrada: EntradaMatch,
  dominants: PerfilRiasec[],
  parcials: ResultatMatch['parcials'],
): string {
  const frases: string[] = []

  if (dominants.length > 0) {
    const perfilPrincipal = dominants[0]
    const categoria = categoriaDominant(estudi, perfilPrincipal)
    if (categoria) {
      frases.push(
        entrada.dominants.length > 0
          ? `encaixa amb el teu perfil ${NOM_PERFIL[perfilPrincipal]}`
          : 'encaixa amb els interessos que has marcat',
      )
    }
  }

  if (parcials.nota != null && estudi.notaTall2026 != null && entrada.notaMitjana != null) {
    const estimada = notaAdmissioEstimada(entrada.notaMitjana)
    const diferencia = estimada - estudi.notaTall2026
    if (diferencia >= 0) {
      frases.push(`la teva nota d'admissió estimada (~${formatDecimal(estimada)}) supera la de tall`)
    } else {
      frases.push(`la teva nota d'admissió estimada (~${formatDecimal(estimada)}) queda ${formatDecimal(Math.abs(diferencia))} punts per sota de la de tall`)
    }
  }

  if (estudi.kmTerrassa != null) {
    frases.push(`és a ${formatKm(estudi.kmTerrassa)} de Terrassa`)
  }

  if (frases.length === 0) return 'Calculat a partir del teu perfil i les teves preferències.'
  const text = frases.join(', ')
  return text.charAt(0).toUpperCase() + text.slice(1) + '.'
}

/** Treu duplicats amb el mateix nom (el mateix cicle o grau ofert a diversos centres),
 * perquè un top 5/6 de recomanacions no es converteixi en el mateix estudi repetit. */
export function desduplicarPerNom<T extends { estudi: EstudiQualsevol }>(llista: T[]): T[] {
  const vistos = new Set<string>()
  const resultat: T[] = []
  for (const item of llista) {
    if (vistos.has(item.estudi.nom)) continue
    vistos.add(item.estudi.nom)
    resultat.push(item)
  }
  return resultat
}

function resoldreDominants(entrada: EntradaMatch): PerfilRiasec[] {
  return entrada.dominants.length > 0 ? entrada.dominants : dominantsDesDInteressos(entrada.interessos ?? [])
}

/** Puntuació i parcials, sense generar el text d'explicació (és la part cara i només cal per als que es mostren). */
function puntuar(estudi: EstudiQualsevol, entrada: EntradaMatch, dominants: PerfilRiasec[]): { puntuacio: number; parcials: ResultatMatch['parcials'] } {
  const riasec = afinitatRiasec(estudi, dominants)
  const nota = puntuacioNota(estudi, entrada.notaMitjana)
  // Sense preferències declarades, pressupost i distància no han de penalitzar (neutre 70).
  const pressupost = entrada.preferencies ? puntuacioPressupost(estudi, entrada.preferencies.pressupostMax) : 70
  const distancia = entrada.preferencies ? puntuacioDistancia(estudi, entrada.preferencies.disposatDesplacar) : 70
  const preferencies = entrada.preferencies ? puntuacioPreferencies(estudi, entrada.preferencies) : 70

  // Si no hi ha nota de tall (FP, batxillerat, artístics, privades), es redistribueix el seu pes.
  const puntuacio =
    nota == null
      ? Math.round(riasec * 0.5 + pressupost * 0.25 + distancia * 0.13 + preferencies * 0.12)
      : Math.round(riasec * 0.4 + nota * 0.2 + pressupost * 0.2 + distancia * 0.1 + preferencies * 0.1)

  return { puntuacio: clamp(puntuacio), parcials: { riasec, nota, pressupost, distancia, preferencies } }
}

function completar(estudi: EstudiQualsevol, entrada: EntradaMatch, dominants: PerfilRiasec[], p: ReturnType<typeof puntuar>): ResultatMatch {
  return {
    puntuacio: p.puntuacio,
    etiqueta: etiquetaDe(p.puntuacio),
    explicacio: generarExplicacio(estudi, entrada, dominants, p.parcials),
    parcials: p.parcials,
  }
}

export function calcularMatch(estudi: EstudiQualsevol, entrada: EntradaMatch): ResultatMatch {
  const dominants = resoldreDominants(entrada)
  return completar(estudi, entrada, dominants, puntuar(estudi, entrada, dominants))
}

export interface Recomanacio {
  estudi: EstudiQualsevol
  match: ResultatMatch
}

/**
 * Les `limit` millors recomanacions (sense repetir nom d'estudi) d'entre `estudis`. Puntua tota
 * l'oferta però només genera l'explicació dels que es retornen: amb ~4.000 estudis, fer-ho per a
 * tots alentia la pàgina de recomanacions, sobretot al mòbil.
 */
export function recomanar(estudis: EstudiQualsevol[], entrada: EntradaMatch, limit: number, puntuacioMinima = 40): Recomanacio[] {
  const dominants = resoldreDominants(entrada)
  const puntuats: { estudi: EstudiQualsevol; p: ReturnType<typeof puntuar> }[] = []
  for (const estudi of estudis) {
    const p = puntuar(estudi, entrada, dominants)
    if (p.puntuacio >= puntuacioMinima) puntuats.push({ estudi, p })
  }
  puntuats.sort((a, b) => b.p.puntuacio - a.p.puntuacio)

  const vistos = new Set<string>()
  const resultat: Recomanacio[] = []
  for (const { estudi, p } of puntuats) {
    if (vistos.has(estudi.nom)) continue
    vistos.add(estudi.nom)
    resultat.push({ estudi, match: completar(estudi, entrada, dominants, p) })
    if (resultat.length >= limit) break
  }
  return resultat
}
