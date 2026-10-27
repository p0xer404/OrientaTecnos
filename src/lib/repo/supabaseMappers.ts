import type { ElementLlista, Grup, Llista, NotaTutor, Perfil, ResultatTest } from '../../types/domain'

// Les files de Supabase vénen en snake_case; aquests mappers les converteixen als tipus
// de domini (camelCase) que fa servir la resta de l'aplicació, els mateixos que demoRepo.

export interface FilaPerfil {
  id: string
  email: string
  role: Perfil['rol']
  nom: string
  group_id: string | null
  curs_actual: string | null
  nota_mitjana: number | null
  interessos: string[]
  estat_decisio: Perfil['estatDecisio']
  consentiment_acceptat: boolean
  consentiment_data: string | null
  es_menor_14: boolean
  consentiment_pares: boolean
  created_at: string
  /** Absent si encara no s'ha executat la migració 2026-10-27. */
  tutor_aprovat?: boolean
}

export function perfilDesDeFila(f: FilaPerfil): Perfil {
  return {
    id: f.id,
    email: f.email,
    rol: f.role,
    nom: f.nom,
    groupId: f.group_id,
    cursActual: f.curs_actual,
    notaMitjana: f.nota_mitjana,
    interessos: f.interessos ?? [],
    estatDecisio: f.estat_decisio,
    consentimentAcceptat: f.consentiment_acceptat,
    consentimentData: f.consentiment_data,
    esMenorDe14: f.es_menor_14,
    consentimentPares: f.consentiment_pares,
    createdAt: f.created_at,
    tutorAprovat: f.tutor_aprovat ?? true,
  }
}

export interface FilaGrup {
  id: string
  nom: string
  curs: string
  tutor_id: string
  codi_invitacio: string
  domini_correu: string
  created_at: string
}

export function grupDesDeFila(f: FilaGrup): Grup {
  return {
    id: f.id,
    nom: f.nom,
    curs: f.curs,
    tutorId: f.tutor_id,
    codiInvitacio: f.codi_invitacio,
    dominiCorreu: f.domini_correu,
    createdAt: f.created_at,
  }
}

export interface FilaLlista {
  id: string
  student_id: string
  nom: string
  es_preinscripcio: boolean
  created_at: string
}

export function llistaDesDeFila(f: FilaLlista): Llista {
  return { id: f.id, studentId: f.student_id, nom: f.nom, esPreinscripcio: f.es_preinscripcio, createdAt: f.created_at }
}

export interface FilaElementLlista {
  id: string
  list_id: string
  estudi_id: string
  estudi_tipus: ElementLlista['estudiTipus']
  posicio: number
}

export function elementLlistaDesDeFila(f: FilaElementLlista): ElementLlista {
  return { id: f.id, listId: f.list_id, estudiId: f.estudi_id, estudiTipus: f.estudi_tipus, posicio: f.posicio }
}

export interface FilaResultatTest {
  id: string
  student_id: string
  test_id: ResultatTest['testId']
  respostes: Record<string, number>
  resultat: ResultatTest['resultat']
  created_at: string
}

export function resultatTestDesDeFila(f: FilaResultatTest): ResultatTest {
  return { id: f.id, studentId: f.student_id, testId: f.test_id, respostes: f.respostes, resultat: f.resultat, createdAt: f.created_at }
}

export interface FilaNotaTutor {
  id: string
  tutor_id: string
  student_id: string
  contingut: string
  updated_at: string
}

export function notaTutorDesDeFila(f: FilaNotaTutor): NotaTutor {
  return { id: f.id, tutorId: f.tutor_id, studentId: f.student_id, contingut: f.contingut, updatedAt: f.updated_at }
}
