import type { PerfilRiasec } from '../../types/domain'
import type { EstudiQualsevol } from '../../types/estudi'

type Pesos = Partial<Record<PerfilRiasec, number>>

export const NOM_PERFIL: Record<PerfilRiasec, string> = {
  R: 'Realista',
  I: 'Investigador',
  A: 'Artístic',
  S: 'Social',
  E: 'Emprenedor',
  C: 'Convencional',
}

export const DESCRIPCIO_PERFIL: Record<PerfilRiasec, string> = {
  R: "T'agrada treballar amb les mans, amb eines, màquines o a l'aire lliure, i resoldre problemes pràctics i concrets.",
  I: "T'agrada observar, investigar, analitzar dades i entendre per què passen les coses abans d'actuar.",
  A: "T'agrada crear, expressar-te i imaginar: dissenyar, escriure, interpretar o compondre amb llibertat.",
  S: "T'agrada ajudar, ensenyar, escoltar i cuidar les persones que t'envolten.",
  E: "T'agrada liderar, convèncer, organitzar projectes i assumir riscos per aconseguir objectius.",
  C: "T'agrada l'ordre, seguir procediments clars, organitzar dades i tenir-ho tot ben estructurat.",
}

// Graus (area ja traduïda a català, vegeu lib/traduccio.ts)
const MAPA_AREA_GRAU: Record<string, Pesos> = {
  'Arts i disseny': { A: 3 },
  'Arts i humanitats': { A: 2, S: 1 },
  Ciències: { I: 3 },
  'Ciències de la salut': { S: 3, I: 2 },
  'Dret, economia i ciències socials': { E: 2, C: 2 },
  Educació: { S: 3 },
  'Enginyeria i arquitectura': { R: 3, I: 2 },
  Altres: {},
}

// Famílies de FP (ja en català a l'origen)
const MAPA_FAMILIA_FP: Record<string, Pesos> = {
  'Activitats físiques i esportives': { R: 3, S: 1 },
  'Administració i gestió': { C: 3, E: 1 },
  Agrària: { R: 3, I: 1 },
  'Arts gràfiques': { A: 3, C: 1 },
  'Comerç i màrqueting': { E: 3, C: 1 },
  'Edificació i obra civil': { R: 3, I: 1 },
  'Electricitat i electrònica': { R: 3, I: 2 },
  'Energia i aigua': { R: 2, I: 2 },
  'Fabricació mecànica': { R: 3, I: 1 },
  'Fusta, moble i suro': { R: 3, A: 1 },
  'Hostaleria i turisme': { S: 2, E: 2 },
  'Imatge i so': { A: 3, I: 1 },
  'Imatge personal': { A: 2, S: 1 },
  'Indústries alimentàries': { I: 2, R: 2 },
  'Indústries extractives': { R: 3, I: 1 },
  'Informàtica i comunicacions': { I: 3, C: 2 },
  'Instal·lació i manteniment': { R: 3, I: 1 },
  Maritimopesquera: { R: 3, I: 1 },
  Química: { I: 3, R: 1 },
  Sanitat: { S: 3, I: 2 },
  'Seguretat i medi ambient': { R: 2, S: 1 },
  'Serveis socioculturals i a la comunitat': { S: 3, E: 1 },
  'Transport i manteniment de vehicles': { R: 3, I: 1 },
  'Tèxtil, confecció i pell': { A: 2, R: 2 },
}

// Modalitats de Batxillerat (traduïdes)
const MAPA_MODALITAT_BATX: Record<string, Pesos> = {
  'Ciències i Tecnologia': { R: 2, I: 3 },
  'Humanitats i Ciències Socials': { S: 2, E: 2, C: 1 },
  Arts: { A: 3 },
  General: { C: 1, S: 1, E: 1 },
}

// Disciplines d'ensenyaments artístics superiors (traduïdes)
const MAPA_DISCIPLINA_ARTISTIC: Record<string, Pesos> = {
  Disseny: { A: 3 },
  Música: { A: 3 },
  'Art dramàtic': { A: 3, S: 1 },
  Dansa: { A: 3, R: 1 },
  'Conservació i restauració de béns culturals': { A: 2, I: 2, R: 1 },
  'Cinema i audiovisuals': { A: 3, I: 1 },
}

/** Totes les categories rellevants d'un estudi (una per a grau/FP, diverses per a
 * batxillerat/artístics quan el centre ofereix més d'una modalitat/disciplina). */
export function categoriesRiasecDe(estudi: EstudiQualsevol): { categoria: string; pesos: Pesos }[] {
  switch (estudi.tipus) {
    case 'grau':
      return [{ categoria: estudi.area, pesos: MAPA_AREA_GRAU[estudi.area] ?? {} }]
    case 'fp':
      return [{ categoria: estudi.area, pesos: MAPA_FAMILIA_FP[estudi.area] ?? {} }]
    case 'batxillerat':
      return estudi.area
        .split(' · ')
        .filter(Boolean)
        .map((m) => ({ categoria: m, pesos: MAPA_MODALITAT_BATX[m] ?? {} }))
    case 'artistic':
      return estudi.area
        .split(' · ')
        .filter(Boolean)
        .map((d) => ({ categoria: d, pesos: MAPA_DISCIPLINA_ARTISTIC[d] ?? {} }))
  }
}

/** Afinitat 0-100 entre un estudi i els perfils dominants de l'alumne. */
export function afinitatRiasec(estudi: EstudiQualsevol, dominants: PerfilRiasec[]): number {
  const categories = categoriesRiasecDe(estudi)
  if (categories.length === 0 || dominants.length === 0) return 50
  let pesMax = 0
  for (const { pesos } of categories) {
    for (const perfil of dominants) {
      pesMax = Math.max(pesMax, pesos[perfil] ?? 0)
    }
  }
  return Math.round((pesMax / 3) * 100)
}

/** Àrees d'interès que es pregunten a l'onboarding i al perfil (coincideixen amb les àrees
 * dels graus, i per tant amb les claus de MAPA_AREA_GRAU). */
export const AREES_INTERES = [
  'Ciències',
  'Ciències de la salut',
  'Enginyeria i arquitectura',
  'Arts i disseny',
  'Arts i humanitats',
  'Dret, economia i ciències socials',
  'Educació',
] as const

/** Perfils RIASEC aproximats a partir de les àrees d'interès, per poder recomanar amb sentit
 * a qui encara no ha fet el test RIASEC (si no, totes les afinitats serien un 50 neutre). */
export function dominantsDesDInteressos(interessos: string[]): PerfilRiasec[] {
  const sumes: Partial<Record<PerfilRiasec, number>> = {}
  for (const area of interessos) {
    for (const [perfil, pes] of Object.entries(MAPA_AREA_GRAU[area] ?? {}) as [PerfilRiasec, number][]) {
      sumes[perfil] = (sumes[perfil] ?? 0) + pes
    }
  }
  const ordenats = (Object.entries(sumes) as [PerfilRiasec, number][]).sort((a, b) => b[1] - a[1])
  if (ordenats.length === 0) return []
  const maxim = ordenats[0][1]
  return ordenats.filter(([, n]) => n >= maxim * 0.75).slice(0, 2).map(([p]) => p)
}

/** Nom de la categoria (àrea/família/modalitat/disciplina) amb més pes per al perfil donat,
 * per explicar el match ("Encaixa amb el teu perfil Investigador..."). */
export function categoriaDominant(estudi: EstudiQualsevol, perfil: PerfilRiasec): string | null {
  const categories = categoriesRiasecDe(estudi)
  let millor: { categoria: string; pes: number } | null = null
  for (const { categoria, pesos } of categories) {
    const pes = pesos[perfil] ?? 0
    if (pes > 0 && (!millor || pes > millor.pes)) millor = { categoria, pes }
  }
  return millor?.categoria ?? null
}
