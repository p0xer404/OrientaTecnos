import type {
  ElementLlista,
  EstatDecisio,
  Grup,
  Llista,
  NotaTutor,
  Perfil,
  ResultatTest,
  Rol,
  TestId,
} from '../../types/domain'
import type { EstudiTipus } from '../../types/estudi'

export interface DadesRegistreAlumne {
  email: string
  password: string
  nom: string
  codiInvitacio: string
  cursActual: string
  esMenorDe14: boolean
  consentimentPares: boolean
}

export interface DadesRegistreTutor {
  email: string
  password: string
  nom: string
}

export interface ExportacioDades {
  perfil: Perfil
  llistes: Llista[]
  elementsLlista: ElementLlista[]
  resultatsTests: ResultatTest[]
  exportatEl: string
}

/** Interfície comuna entre el repositori de mode demo (localStorage) i el de Supabase,
 * perquè la resta de l'app (pàgines i components) no sàpiga mai amb quin backend parla. */
export interface Repositori {
  readonly mode: 'demo' | 'supabase'

  // Autenticació
  login(email: string, password: string): Promise<Perfil>
  registrarAlumne(dades: DadesRegistreAlumne): Promise<Perfil>
  registrarTutor(dades: DadesRegistreTutor): Promise<Perfil>
  logout(): Promise<void>
  usuariActual(): Promise<Perfil | null>

  // Perfil
  obtenirPerfil(id: string): Promise<Perfil | null>
  actualitzarPerfil(id: string, canvis: Partial<Perfil>): Promise<Perfil>
  descarregarLesMevesDades(id: string): Promise<ExportacioDades>
  esborrarElMeuCompte(id: string): Promise<void>

  // Grups (tutor / admin)
  crearGrup(nom: string, curs: string, tutorId: string): Promise<Grup>
  grupsDelTutor(tutorId: string): Promise<Grup[]>
  totsElsGrups(): Promise<Grup[]>
  regenerarCodiInvitacio(grupId: string): Promise<Grup>
  eliminarGrup(grupId: string): Promise<void>
  alumnesDelGrup(grupId: string): Promise<Perfil[]>
  totsElsAlumnes(): Promise<Perfil[]>
  totsElsTutors(): Promise<Perfil[]>
  donarDeBaixaAlumne(alumneId: string): Promise<void>

  // Llistes
  llistesDeLAlumne(studentId: string): Promise<Llista[]>
  crearLlista(studentId: string, nom: string): Promise<Llista>
  eliminarLlista(listId: string): Promise<void>
  marcarComPreinscripcio(listId: string): Promise<void>
  elementsDeLaLlista(listId: string): Promise<ElementLlista[]>
  afegirElement(listId: string, estudiId: string, estudiTipus: EstudiTipus): Promise<ElementLlista>
  treureElement(itemId: string): Promise<void>
  reordenarLlista(listId: string, idsOrdenats: string[]): Promise<void>

  // Tests
  desarResultatTest(studentId: string, testId: TestId, respostes: Record<string, number>, resultat: unknown): Promise<ResultatTest>
  resultatsDeLAlumne(studentId: string): Promise<ResultatTest[]>
  ultimResultat(studentId: string, testId: TestId): Promise<ResultatTest | null>

  // Notes del tutor
  notaDelTutor(tutorId: string, studentId: string): Promise<NotaTutor | null>
  desarNotaDelTutor(tutorId: string, studentId: string, contingut: string): Promise<NotaTutor>

  // Estat de decisió (actualitza perfil, però amb helper explícit)
  actualitzarEstatDecisio(studentId: string, estat: EstatDecisio): Promise<void>
}

export const ROLS: Rol[] = ['alumne', 'tutor', 'admin']
