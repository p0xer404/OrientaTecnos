import type { EstudiTipus } from './estudi'

export type Rol = 'alumne' | 'tutor' | 'admin'

export type EstatDecisio = 'no_ho_se' | 'tinc_opcions' | 'ho_tinc_clar'

export const ETIQUETES_ESTAT_DECISIO: Record<EstatDecisio, string> = {
  no_ho_se: 'Encara no ho sé',
  tinc_opcions: 'Tinc opcions',
  ho_tinc_clar: 'Ho tinc clar',
}

export interface Perfil {
  id: string
  email: string
  rol: Rol
  nom: string
  groupId: string | null
  cursActual: string | null
  notaMitjana: number | null
  interessos: string[]
  estatDecisio: EstatDecisio
  consentimentAcceptat: boolean
  consentimentData: string | null
  esMenorDe14: boolean
  consentimentPares: boolean
  createdAt: string
  /** Només per a tutors: false mentre un admin no aprova el compte (vegeu la migració
   * 2026-10-27). Absent = aprovat (comptes antics i dades de demostració). */
  tutorAprovat?: boolean
}

export interface Grup {
  id: string
  nom: string
  curs: string
  tutorId: string
  codiInvitacio: string
  /** Domini de correu del tutor/a en crear el grup (ex: "escolatecnos.cat"). Els alumnes
   * només es poden registrar en aquest grup amb un correu d'aquest mateix domini. */
  dominiCorreu: string
  createdAt: string
}

export interface Llista {
  id: string
  studentId: string
  nom: string
  esPreinscripcio: boolean
  createdAt: string
}

export interface ElementLlista {
  id: string
  listId: string
  estudiId: string
  estudiTipus: EstudiTipus
  posicio: number
}

export type TestId = 'riasec' | 'habilitats' | 'preferencies'

export type PerfilRiasec = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

export interface ResultatRiasec {
  puntuacions: Record<PerfilRiasec, number>
  dominants: PerfilRiasec[]
}

export interface ResultatHabilitats {
  puntuacions: Record<string, number>
}

export interface ResultatPreferencies {
  universitatVsFp: number
  publicVsPrivat: number
  pressupostMax: number
  disposatDesplacar: number
  importanciaNota: number
  importanciaIdioma: number
  /** Matèries on l'alumne/a treu millor nota (recollit a l'onboarding inicial). */
  materiesBones?: string[]
  /** Matèries on l'alumne/a treu pitjor nota. */
  materiesFluixes?: string[]
  /** Matèries que li agraden més, independentment de la nota. */
  materiesPreferides?: string[]
  /** Matèries que li agraden menys. */
  materiesMenysPreferides?: string[]
}

export interface ResultatTest {
  id: string
  studentId: string
  testId: TestId
  respostes: Record<string, number>
  resultat: ResultatRiasec | ResultatHabilitats | ResultatPreferencies
  createdAt: string
}

export interface NotaTutor {
  id: string
  tutorId: string
  studentId: string
  contingut: string
  updatedAt: string
}
