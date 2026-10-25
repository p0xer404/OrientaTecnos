import type { BaseDadesDemo } from './storage'
import { generarId } from './storage'
import type { Perfil } from '../../types/domain'

const ARA = new Date().toISOString()

// IMPORTANT: totes les persones, grups i resultats d'aquest fitxer són EXEMPLES FICTICIS
// perquè es pugui ensenyar l'aplicació a l'escola abans de tenir el permís per fer-hi
// servir dades d'alumnes reals. Cap d'aquests noms correspon a cap alumne real.
// Les credencials de demo es mostren a la pàgina de login.

function perfil(parcial: Partial<Perfil> & Pick<Perfil, 'id' | 'email' | 'rol' | 'nom'>): Perfil {
  return {
    groupId: null,
    cursActual: null,
    notaMitjana: null,
    interessos: [],
    estatDecisio: 'no_ho_se',
    consentimentAcceptat: true,
    consentimentData: ARA,
    esMenorDe14: false,
    consentimentPares: false,
    createdAt: ARA,
    ...parcial,
  }
}

export function construirBaseDadesDemo(): BaseDadesDemo {
  const adminId = 'demo-admin'
  const tutor1Id = 'demo-tutor-1'
  const tutor2Id = 'demo-tutor-2'
  const grup1Id = 'demo-grup-1'
  const grup2Id = 'demo-grup-2'

  const alumnes: Perfil[] = [
    perfil({
      id: 'demo-alumne-1',
      email: 'laia.alumna@demo.tecnos.cat',
      rol: 'alumne',
      nom: 'Laia Ferrer',
      groupId: grup1Id,
      cursActual: '4t ESO',
      notaMitjana: 8.1,
      interessos: ['Ciències de la salut', 'Ciències'],
      estatDecisio: 'tinc_opcions',
    }),
    perfil({
      id: 'demo-alumne-2',
      email: 'marc.alumne@demo.tecnos.cat',
      rol: 'alumne',
      nom: 'Marc Vidal',
      groupId: grup1Id,
      cursActual: '4t ESO',
      notaMitjana: 6.4,
      interessos: ['Enginyeria i arquitectura', 'Ciències'],
      estatDecisio: 'no_ho_se',
    }),
    perfil({
      id: 'demo-alumne-3',
      email: 'nuria.alumna@demo.tecnos.cat',
      rol: 'alumne',
      nom: 'Núria Camps',
      groupId: grup1Id,
      cursActual: '4t ESO',
      notaMitjana: 7.8,
      interessos: ['Arts i disseny', 'Arts i humanitats'],
      estatDecisio: 'ho_tinc_clar',
    }),
    perfil({
      id: 'demo-alumne-4',
      email: 'pol.alumne@demo.tecnos.cat',
      rol: 'alumne',
      nom: 'Pol Sánchez',
      groupId: grup2Id,
      cursActual: '2n Batxillerat',
      notaMitjana: 7.2,
      interessos: ['Enginyeria i arquitectura', 'Ciències'],
      estatDecisio: 'tinc_opcions',
    }),
    perfil({
      id: 'demo-alumne-5',
      email: 'ariadna.alumna@demo.tecnos.cat',
      rol: 'alumne',
      nom: 'Ariadna Lopez',
      groupId: grup2Id,
      cursActual: '2n Batxillerat',
      notaMitjana: 9.0,
      interessos: ['Ciències de la salut', 'Ciències'],
      estatDecisio: 'tinc_opcions',
    }),
    perfil({
      id: 'demo-alumne-6',
      email: 'jan.alumne@demo.tecnos.cat',
      rol: 'alumne',
      nom: 'Jan Rovira',
      groupId: grup2Id,
      cursActual: '2n Batxillerat',
      notaMitjana: 5.9,
      interessos: ['Dret, economia i ciències socials', 'Educació'],
      estatDecisio: 'no_ho_se',
    }),
  ]

  const perfils: Perfil[] = [
    perfil({ id: adminId, email: 'admin@demo.tecnos.cat', rol: 'admin', nom: 'Direcció Tecnos' }),
    perfil({ id: tutor1Id, email: 'tutor1@demo.tecnos.cat', rol: 'tutor', nom: 'Marta Puig' }),
    perfil({ id: tutor2Id, email: 'tutor2@demo.tecnos.cat', rol: 'tutor', nom: 'David Soler' }),
    ...alumnes,
  ]

  const credencials: Record<string, string> = {}
  for (const p of perfils) credencials[p.email] = 'demo1234'

  const db: BaseDadesDemo = {
    perfils,
    credencials,
    grups: [
      { id: grup1Id, nom: '4t ESO A', curs: '2026-2027', tutorId: tutor1Id, codiInvitacio: 'DEMO4A', dominiCorreu: 'demo.tecnos.cat', createdAt: ARA },
      { id: grup2Id, nom: '2n Batxillerat B', curs: '2026-2027', tutorId: tutor2Id, codiInvitacio: 'DEMOB1', dominiCorreu: 'demo.tecnos.cat', createdAt: ARA },
    ],
    llistes: [],
    elementsLlista: [],
    resultatsTests: [],
    notesTutor: [
      {
        id: generarId('nota'),
        tutorId: tutor1Id,
        studentId: 'demo-alumne-2',
        contingut: "Dubta entre FP d'Informàtica i Batxillerat. Parlar amb la família a la pròxima reunió.",
        updatedAt: ARA,
      },
    ],
  }

  // Llistes d'exemple amb estudis reals de data/ (noms i centres reals, alumnes ficticis).
  const llista1Id = generarId('llista')
  db.llistes.push({ id: llista1Id, studentId: 'demo-alumne-1', nom: 'Opcions preinscripció', esPreinscripcio: true, createdAt: ARA })
  db.elementsLlista.push(
    { id: generarId('item'), listId: llista1Id, estudiId: 'pre-1103', estudiTipus: 'grau', posicio: 0 },
    { id: generarId('item'), listId: llista1Id, estudiId: 'pre-918', estudiTipus: 'grau', posicio: 1 },
  )

  const llista2Id = generarId('llista')
  db.llistes.push({ id: llista2Id, studentId: 'demo-alumne-2', nom: 'Plan B', esPreinscripcio: false, createdAt: ARA })
  db.elementsLlista.push(
    { id: generarId('item'), listId: llista2Id, estudiId: 'fp-506', estudiTipus: 'fp', posicio: 0 },
    { id: generarId('item'), listId: llista2Id, estudiId: 'pre-2666', estudiTipus: 'grau', posicio: 1 },
  )

  const llista3Id = generarId('llista')
  db.llistes.push({ id: llista3Id, studentId: 'demo-alumne-4', nom: 'Les meves opcions', esPreinscripcio: true, createdAt: ARA })
  db.elementsLlista.push(
    { id: generarId('item'), listId: llista3Id, estudiId: 'pre-2666', estudiTipus: 'grau', posicio: 0 },
    { id: generarId('item'), listId: llista3Id, estudiId: 'batx-08029684', estudiTipus: 'batxillerat', posicio: 1 },
  )

  // Resultats de test RIASEC d'exemple (puntuacions ja calculades, no cal refer el test).
  db.resultatsTests.push(
    {
      id: generarId('test'),
      studentId: 'demo-alumne-1',
      testId: 'riasec',
      respostes: {},
      resultat: { puntuacions: { R: 40, I: 85, A: 55, S: 70, E: 35, C: 45 }, dominants: ['I', 'S'] },
      createdAt: ARA,
    },
    {
      id: generarId('test'),
      studentId: 'demo-alumne-2',
      testId: 'riasec',
      respostes: {},
      resultat: { puntuacions: { R: 60, I: 80, A: 50, S: 30, E: 45, C: 65 }, dominants: ['I'] },
      createdAt: ARA,
    },
    {
      id: generarId('test'),
      studentId: 'demo-alumne-3',
      testId: 'riasec',
      respostes: {},
      resultat: { puntuacions: { R: 30, I: 40, A: 90, S: 50, E: 40, C: 25 }, dominants: ['A'] },
      createdAt: ARA,
    },
  )

  // Tots els alumnes de demo ja han completat el qüestionari inicial (/benvinguda), perquè
  // en entrar-hi no se'ls obligui a fer-lo i es vegin directament recomanacions.
  const preferenciesDemo: [string, number, number, number, number, string[], string[], string[], string[]][] = [
    ['demo-alumne-1', 75, 40, 3000, 40, ['Biologia i Geologia', 'Física i Química'], ['Història', 'Música'], ['Biologia i Geologia', 'Educació Física'], ['Economia', 'Música']],
    ['demo-alumne-2', 35, 50, 1500, 25, ['Tecnologia', 'Matemàtiques'], ['Llengua catalana', 'Història'], ['Tecnologia', 'Educació Física'], ['Història', 'Filosofia / Valors ètics']],
    ['demo-alumne-3', 60, 60, 6000, 50, ['Arts Plàstiques', 'Música'], ['Matemàtiques', 'Física i Química'], ['Arts Plàstiques', 'Llengua catalana'], ['Matemàtiques', 'Tecnologia']],
    ['demo-alumne-4', 80, 30, 2500, 60, ['Matemàtiques', 'Física i Química'], ['Llengua castellana', 'Filosofia / Valors ètics'], ['Tecnologia', 'Matemàtiques'], ['Filosofia / Valors ètics', 'Història']],
    ['demo-alumne-5', 90, 50, 4000, 80, ['Biologia i Geologia', 'Matemàtiques'], ['Educació Física', 'Música'], ['Biologia i Geologia', 'Física i Química'], ['Música', 'Arts Plàstiques']],
    ['demo-alumne-6', 30, 50, 1500, 20, ['Economia', 'Educació Física'], ['Matemàtiques', 'Física i Química'], ['Economia', 'Educació Física'], ['Física i Química', 'Biologia i Geologia']],
  ]
  for (const [studentId, universitatVsFp, publicVsPrivat, pressupostMax, disposatDesplacar, bones, fluixes, preferides, menys] of preferenciesDemo) {
    db.resultatsTests.push({
      id: generarId('test'),
      studentId,
      testId: 'preferencies',
      respostes: {},
      resultat: {
        universitatVsFp,
        publicVsPrivat,
        importanciaNota: 50,
        importanciaIdioma: 50,
        pressupostMax,
        disposatDesplacar,
        materiesBones: bones,
        materiesFluixes: fluixes,
        materiesPreferides: preferides,
        materiesMenysPreferides: menys,
      },
      createdAt: ARA,
    })
  }

  return db
}
