import { construirBaseDadesDemo } from './demoSeed'
import { dominiDeCorreu } from '../email'
import { desarBaseDades, desarSessio, generarCodiInvitacio, generarId, llegirBaseDades, obtenirSessio, type BaseDadesDemo } from './storage'
import type { DadesRegistreAlumne, DadesRegistreTutor, ExportacioDades, Repositori } from './types'
import type { ElementLlista, EstatDecisio, Grup, Llista, NotaTutor, Perfil, ResultatTest, TestId } from '../../types/domain'
import type { EstudiTipus } from '../../types/estudi'

let dbCache: BaseDadesDemo | null = null

function db(): BaseDadesDemo {
  if (dbCache) return dbCache
  const llegida = llegirBaseDades()
  if (llegida.perfils.length === 0) {
    dbCache = construirBaseDadesDemo()
    desarBaseDades(dbCache)
  } else {
    dbCache = llegida
  }
  return dbCache
}

function desar(): void {
  if (dbCache) desarBaseDades(dbCache)
}

function requerir<T>(valor: T | null | undefined, missatge: string): T {
  if (valor == null) throw new Error(missatge)
  return valor
}

/** Retorna sempre còpies: si es retornessin els objectes interns, React rebria la mateixa
 * referència després d'una mutació i no tornaria a renderitzar (i els components podrien
 * modificar la "base de dades" sense voler). */
function copia<T>(valor: T): T {
  return structuredClone(valor)
}

function ordenarPerDataDesc(resultats: ResultatTest[]): ResultatTest[] {
  return resultats
    .map((r, i) => ({ r, i }))
    .sort((a, b) => b.r.createdAt.localeCompare(a.r.createdAt) || b.i - a.i)
    .map(({ r }) => r)
}

function esborrarDadesDeLUsuari(data: BaseDadesDemo, id: string): void {
  const llistesIds = new Set(data.llistes.filter((l) => l.studentId === id).map((l) => l.id))
  data.elementsLlista = data.elementsLlista.filter((e) => !llistesIds.has(e.listId))
  data.llistes = data.llistes.filter((l) => l.studentId !== id)
  data.resultatsTests = data.resultatsTests.filter((r) => r.studentId !== id)
  data.notesTutor = data.notesTutor.filter((n) => n.studentId !== id && n.tutorId !== id)
  const grupsPropis = new Set(data.grups.filter((g) => g.tutorId === id).map((g) => g.id))
  data.grups = data.grups.filter((g) => g.tutorId !== id)
  for (const p of data.perfils) if (p.groupId && grupsPropis.has(p.groupId)) p.groupId = null
  const perfil = data.perfils.find((p) => p.id === id)
  if (perfil) delete data.credencials[perfil.email]
  data.perfils = data.perfils.filter((p) => p.id !== id)
}

export const demoRepo: Repositori = {
  mode: 'demo',

  async login(email, password) {
    const data = db()
    const correu = email.toLowerCase().trim()
    const esperada = data.credencials[correu]
    if (!esperada || esperada !== password) {
      throw new Error('Correu o contrasenya incorrectes.')
    }
    const perfil = requerir(
      data.perfils.find((p) => p.email.toLowerCase() === correu),
      'No s\'ha trobat el perfil.',
    )
    desarSessio(perfil.id)
    return copia(perfil)
  },

  async registrarAlumne(dades: DadesRegistreAlumne) {
    const data = db()
    const email = dades.email.toLowerCase().trim()
    if (data.perfils.some((p) => p.email.toLowerCase() === email)) {
      throw new Error('Ja existeix un compte amb aquest correu.')
    }
    const grup = data.grups.find((g) => g.codiInvitacio === dades.codiInvitacio.toUpperCase().trim())
    if (!grup) throw new Error('El codi de classe no és vàlid. Demana\'l al teu tutor/a.')
    if (grup.dominiCorreu && dominiDeCorreu(email) !== grup.dominiCorreu) {
      throw new Error(`Per registrar-te en aquesta classe cal fer servir un correu "@${grup.dominiCorreu}".`)
    }
    if (dades.esMenorDe14 && !dades.consentimentPares) {
      throw new Error('Si tens menys de 14 anys, cal el consentiment dels pares o tutors legals.')
    }

    const nou: Perfil = {
      id: generarId('alumne'),
      email,
      rol: 'alumne',
      nom: dades.nom.trim(),
      groupId: grup.id,
      cursActual: dades.cursActual,
      notaMitjana: null,
      interessos: [],
      estatDecisio: 'no_ho_se',
      consentimentAcceptat: true,
      consentimentData: new Date().toISOString(),
      esMenorDe14: dades.esMenorDe14,
      consentimentPares: dades.consentimentPares,
      createdAt: new Date().toISOString(),
    }
    data.perfils.push(nou)
    data.credencials[email] = dades.password
    desar()
    desarSessio(nou.id)
    return copia(nou)
  },

  async registrarTutor(dades: DadesRegistreTutor) {
    const data = db()
    const email = dades.email.toLowerCase().trim()
    if (data.perfils.some((p) => p.email.toLowerCase() === email)) {
      throw new Error('Ja existeix un compte amb aquest correu.')
    }
    const nou: Perfil = {
      id: generarId('tutor'),
      email,
      rol: 'tutor',
      nom: dades.nom.trim(),
      groupId: null,
      cursActual: null,
      notaMitjana: null,
      interessos: [],
      estatDecisio: 'no_ho_se',
      consentimentAcceptat: true,
      consentimentData: new Date().toISOString(),
      esMenorDe14: false,
      consentimentPares: false,
      createdAt: new Date().toISOString(),
    }
    data.perfils.push(nou)
    data.credencials[email] = dades.password
    desar()
    desarSessio(nou.id)
    return copia(nou)
  },

  async logout() {
    desarSessio(null)
  },

  async usuariActual() {
    const id = obtenirSessio()
    if (!id) return null
    const perfil = db().perfils.find((p) => p.id === id)
    if (!perfil) {
      desarSessio(null)
      return null
    }
    return copia(perfil)
  },

  async obtenirPerfil(id) {
    const perfil = db().perfils.find((p) => p.id === id)
    return perfil ? copia(perfil) : null
  },

  async actualitzarPerfil(id, canvis) {
    const data = db()
    const perfil = requerir(data.perfils.find((p) => p.id === id), 'Perfil no trobat.')
    Object.assign(perfil, canvis)
    desar()
    return copia(perfil)
  },

  async actualitzarEstatDecisio(studentId, estat: EstatDecisio) {
    await demoRepo.actualitzarPerfil(studentId, { estatDecisio: estat })
  },

  async descarregarLesMevesDades(id): Promise<ExportacioDades> {
    const data = db()
    const perfil = requerir(data.perfils.find((p) => p.id === id), 'Perfil no trobat.')
    const llistes = data.llistes.filter((l) => l.studentId === id)
    const idsLlistes = new Set(llistes.map((l) => l.id))
    const elementsLlista = data.elementsLlista.filter((e) => idsLlistes.has(e.listId))
    const resultatsTests = data.resultatsTests.filter((r) => r.studentId === id)
    return copia({ perfil, llistes, elementsLlista, resultatsTests, exportatEl: new Date().toISOString() })
  },

  async esborrarElMeuCompte(id) {
    esborrarDadesDeLUsuari(db(), id)
    desar()
    desarSessio(null)
  },

  async crearGrup(nom, curs, tutorId) {
    const data = db()
    const tutor = requerir(data.perfils.find((p) => p.id === tutorId), 'Tutor/a no trobat.')
    const codisExistents = new Set(data.grups.map((g) => g.codiInvitacio))
    let codi = generarCodiInvitacio()
    while (codisExistents.has(codi)) codi = generarCodiInvitacio()
    const grup: Grup = {
      id: generarId('grup'),
      nom,
      curs,
      tutorId,
      codiInvitacio: codi,
      dominiCorreu: dominiDeCorreu(tutor.email),
      createdAt: new Date().toISOString(),
    }
    data.grups.push(grup)
    desar()
    return copia(grup)
  },

  async grupsDelTutor(tutorId) {
    return copia(db().grups.filter((g) => g.tutorId === tutorId))
  },

  async totsElsGrups() {
    return copia(db().grups)
  },

  async regenerarCodiInvitacio(grupId) {
    const data = db()
    const grup = requerir(data.grups.find((g) => g.id === grupId), 'Grup no trobat.')
    const codisExistents = new Set(data.grups.map((g) => g.codiInvitacio))
    let codi = generarCodiInvitacio()
    while (codisExistents.has(codi)) codi = generarCodiInvitacio()
    grup.codiInvitacio = codi
    desar()
    return copia(grup)
  },

  async eliminarGrup(grupId) {
    const data = db()
    data.grups = data.grups.filter((g) => g.id !== grupId)
    for (const p of data.perfils) if (p.groupId === grupId) p.groupId = null
    desar()
  },

  async alumnesDelGrup(grupId) {
    return copia(db().perfils.filter((p) => p.rol === 'alumne' && p.groupId === grupId))
  },

  async totsElsAlumnes() {
    return copia(db().perfils.filter((p) => p.rol === 'alumne'))
  },

  async totsElsTutors() {
    return copia(db().perfils.filter((p) => p.rol === 'tutor'))
  },

  async donarDeBaixaAlumne(alumneId) {
    // Sense tocar la sessió: qui dona de baixa és l'admin, no l'alumne.
    esborrarDadesDeLUsuari(db(), alumneId)
    desar()
  },

  async llistesDeLAlumne(studentId) {
    return copia(db().llistes.filter((l) => l.studentId === studentId))
  },

  async crearLlista(studentId, nom) {
    const data = db()
    const llista: Llista = { id: generarId('llista'), studentId, nom, esPreinscripcio: false, createdAt: new Date().toISOString() }
    data.llistes.push(llista)
    desar()
    return copia(llista)
  },

  async eliminarLlista(listId) {
    const data = db()
    data.llistes = data.llistes.filter((l) => l.id !== listId)
    data.elementsLlista = data.elementsLlista.filter((e) => e.listId !== listId)
    desar()
  },

  async marcarComPreinscripcio(listId) {
    const data = db()
    const llista = requerir(data.llistes.find((l) => l.id === listId), 'Llista no trobada.')
    for (const l of data.llistes) if (l.studentId === llista.studentId) l.esPreinscripcio = l.id === listId
    desar()
  },

  async elementsDeLaLlista(listId) {
    return copia(
      db()
        .elementsLlista.filter((e) => e.listId === listId)
        .sort((a, b) => a.posicio - b.posicio),
    )
  },

  async afegirElement(listId, estudiId, estudiTipus: EstudiTipus) {
    const data = db()
    const existents = data.elementsLlista.filter((e) => e.listId === listId)
    const jaHiEs = existents.find((e) => e.estudiId === estudiId)
    if (jaHiEs) return copia(jaHiEs)
    const posicio = existents.reduce((max, e) => Math.max(max, e.posicio + 1), 0)
    const element: ElementLlista = { id: generarId('item'), listId, estudiId, estudiTipus, posicio }
    data.elementsLlista.push(element)
    desar()
    return copia(element)
  },

  async treureElement(itemId) {
    const data = db()
    data.elementsLlista = data.elementsLlista.filter((e) => e.id !== itemId)
    desar()
  },

  async reordenarLlista(listId, idsOrdenats) {
    const data = db()
    idsOrdenats.forEach((id, index) => {
      const element = data.elementsLlista.find((e) => e.id === id && e.listId === listId)
      if (element) element.posicio = index
    })
    desar()
  },

  async desarResultatTest(studentId, testId: TestId, respostes, resultat) {
    const data = db()
    const nou: ResultatTest = {
      id: generarId('test'),
      studentId,
      testId,
      respostes,
      resultat: resultat as ResultatTest['resultat'],
      createdAt: new Date().toISOString(),
    }
    data.resultatsTests.push(nou)
    desar()
    return copia(nou)
  },

  async resultatsDeLAlumne(studentId) {
    return copia(ordenarPerDataDesc(db().resultatsTests.filter((r) => r.studentId === studentId)))
  },

  async ultimResultat(studentId, testId: TestId) {
    const [ultim] = ordenarPerDataDesc(db().resultatsTests.filter((r) => r.studentId === studentId && r.testId === testId))
    return ultim ? copia(ultim) : null
  },

  async notaDelTutor(tutorId, studentId) {
    const nota = db().notesTutor.find((n) => n.tutorId === tutorId && n.studentId === studentId)
    return nota ? copia(nota) : null
  },

  async desarNotaDelTutor(tutorId, studentId, contingut): Promise<NotaTutor> {
    const data = db()
    const existent = data.notesTutor.find((n) => n.tutorId === tutorId && n.studentId === studentId)
    if (existent) {
      existent.contingut = contingut
      existent.updatedAt = new Date().toISOString()
      desar()
      return copia(existent)
    }
    const nova: NotaTutor = { id: generarId('nota'), tutorId, studentId, contingut, updatedAt: new Date().toISOString() }
    data.notesTutor.push(nova)
    desar()
    return copia(nova)
  },
}
