import { supabase } from './supabaseClient'
import { dominiDeCorreu } from '../email'
import { generarCodiInvitacio } from './storage'
import {
  elementLlistaDesDeFila,
  grupDesDeFila,
  llistaDesDeFila,
  notaTutorDesDeFila,
  perfilDesDeFila,
  resultatTestDesDeFila,
  type FilaElementLlista,
  type FilaGrup,
  type FilaLlista,
  type FilaNotaTutor,
  type FilaPerfil,
  type FilaResultatTest,
} from './supabaseMappers'
import type { DadesRegistreAlumne, DadesRegistreTutor, ExportacioDades, Repositori } from './types'
import type { EstatDecisio, Perfil, TestId } from '../../types/domain'
import type { EstudiTipus } from '../../types/estudi'

function db() {
  if (!supabase) throw new Error('Supabase no està configurat (falten VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).')
  return supabase
}

async function perfilPerId(id: string): Promise<Perfil | null> {
  const { data, error } = await db().from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? perfilDesDeFila(data as FilaPerfil) : null
}

/** Cert si la funció RPC encara no existeix a la base de dades (la migració de
 * supabase/migracions/ no s'ha executat): llavors es fa servir el camí antic. */
function esFuncioInexistent(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === 'PGRST202' || error.code === '42883' || /could not find the function|function .* does not exist/i.test(error.message ?? '')
}

async function dominiDelCodiDeClasse(codi: string): Promise<{ trobat: boolean; domini: string | null; groupId: string | null }> {
  const codiNet = codi.toUpperCase().trim()
  const { data, error } = await db().rpc('validar_codi_classe', { codi: codiNet })
  if (!error) {
    const fila = (data as { domini_correu: string }[] | null)?.[0]
    return { trobat: Boolean(fila), domini: fila?.domini_correu ?? null, groupId: null }
  }
  if (!esFuncioInexistent(error)) throw error
  const { data: grup, error: errGrup } = await db().from('groups').select('id, domini_correu').eq('codi_invitacio', codiNet).maybeSingle()
  if (errGrup) throw errGrup
  return { trobat: Boolean(grup), domini: grup?.domini_correu ?? null, groupId: grup?.id ?? null }
}

async function inserirAmbCodiUnic<T>(intent: (codi: string) => PromiseLike<{ data: T | null; error: { code?: string } | null }>): Promise<T> {
  for (let i = 0; i < 5; i++) {
    const { data, error } = await intent(generarCodiInvitacio())
    if (!error && data) return data
    if (error?.code !== '23505') throw error
  }
  throw new Error('No s\'ha pogut generar un codi de classe únic. Torna-ho a provar.')
}

export const supabaseRepo: Repositori = {
  mode: 'supabase',

  async login(email, password) {
    const { data, error } = await db().auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw new Error('Correu o contrasenya incorrectes.')
    const perfil = await perfilPerId(data.user.id)
    if (!perfil) {
      // Compte sense perfil (p. ex. esborrat): no es pot deixar la sessió oberta a mitges.
      await db().auth.signOut()
      throw new Error('Aquest compte ja no existeix. Si creus que és un error, parla amb el teu tutor/a.')
    }
    return perfil
  },

  async registrarAlumne(dades: DadesRegistreAlumne) {
    if (dades.esMenorDe14 && !dades.consentimentPares) {
      throw new Error('Si tens menys de 14 anys, cal el consentiment dels pares o tutors legals.')
    }
    const codi = dades.codiInvitacio.toUpperCase().trim()
    const grup = await dominiDelCodiDeClasse(codi)
    if (!grup.trobat) throw new Error('El codi de classe no és vàlid. Demana\'l al teu tutor/a.')
    if (grup.domini && dominiDeCorreu(dades.email) !== grup.domini) {
      throw new Error(`Per registrar-te en aquesta classe cal fer servir un correu "@${grup.domini}".`)
    }

    const { data, error } = await db().auth.signUp({
      email: dades.email.trim(),
      password: dades.password,
      options: {
        data: {
          role: 'alumne',
          nom: dades.nom.trim(),
          // El servidor (trigger handle_new_user) torna a validar el codi i el domini; el
          // group_id només el fa servir l'esquema antic, abans d'executar la migració.
          codi_invitacio: codi,
          ...(grup.groupId ? { group_id: grup.groupId } : {}),
          curs_actual: dades.cursActual,
          es_menor_14: dades.esMenorDe14,
          consentiment_pares: dades.consentimentPares,
        },
      },
    })
    if (error) {
      if (/database error saving new user/i.test(error.message)) {
        throw new Error('No s\'ha pogut crear el compte: revisa el codi de classe i que el correu sigui del domini correcte.')
      }
      if (/already registered|already been registered/i.test(error.message)) throw new Error('Ja existeix un compte amb aquest correu.')
      throw error
    }
    if (!data.user) throw new Error('No s\'ha pogut crear el compte.')
    const perfil = await perfilPerId(data.user.id)
    if (!perfil) throw new Error('El compte s\'ha creat però encara no es pot llegir el perfil; torna-ho a provar en uns segons.')
    return perfil
  },

  async registrarTutor(dades: DadesRegistreTutor) {
    const { data, error } = await db().auth.signUp({
      email: dades.email.trim(),
      password: dades.password,
      options: { data: { role: 'tutor', nom: dades.nom.trim() } },
    })
    if (error) {
      if (/already registered|already been registered/i.test(error.message)) throw new Error('Ja existeix un compte amb aquest correu.')
      throw error
    }
    if (!data.user) throw new Error('No s\'ha pogut crear el compte.')
    const perfil = await perfilPerId(data.user.id)
    if (!perfil) throw new Error('El compte s\'ha creat però encara no es pot llegir el perfil; torna-ho a provar en uns segons.')
    return perfil
  },

  async logout() {
    await db().auth.signOut()
  },

  async usuariActual() {
    const { data } = await db().auth.getUser()
    if (!data.user) return null
    const perfil = await perfilPerId(data.user.id)
    if (!perfil) await db().auth.signOut()
    return perfil
  },

  async obtenirPerfil(id) {
    return perfilPerId(id)
  },

  async actualitzarPerfil(id, canvis) {
    const columnes: Record<string, unknown> = {}
    if ('notaMitjana' in canvis) columnes.nota_mitjana = canvis.notaMitjana
    if ('interessos' in canvis) columnes.interessos = canvis.interessos
    if ('estatDecisio' in canvis) columnes.estat_decisio = canvis.estatDecisio
    if ('cursActual' in canvis) columnes.curs_actual = canvis.cursActual
    if ('nom' in canvis) columnes.nom = canvis.nom
    if ('groupId' in canvis) columnes.group_id = canvis.groupId
    const { data, error } = await db().from('profiles').update(columnes).eq('id', id).select('*').single()
    if (error) throw error
    return perfilDesDeFila(data as FilaPerfil)
  },

  async actualitzarEstatDecisio(studentId, estat: EstatDecisio) {
    const { error } = await db().from('profiles').update({ estat_decisio: estat }).eq('id', studentId)
    if (error) throw error
  },

  async descarregarLesMevesDades(id): Promise<ExportacioDades> {
    const perfil = await perfilPerId(id)
    if (!perfil) throw new Error('Perfil no trobat.')
    const { data: llistesData, error: e1 } = await db().from('lists').select('*').eq('student_id', id)
    if (e1) throw e1
    const llistes = (llistesData as FilaLlista[]).map(llistaDesDeFila)
    const idsLlistes = llistes.map((l) => l.id)
    const { data: elementsData, error: e2 } = idsLlistes.length
      ? await db().from('list_items').select('*').in('list_id', idsLlistes)
      : { data: [] as FilaElementLlista[], error: null }
    if (e2) throw e2
    const { data: resultatsData, error: e3 } = await db().from('test_results').select('*').eq('student_id', id)
    if (e3) throw e3
    return {
      perfil,
      llistes,
      elementsLlista: (elementsData as FilaElementLlista[]).map(elementLlistaDesDeFila),
      resultatsTests: (resultatsData as FilaResultatTest[]).map(resultatTestDesDeFila),
      exportatEl: new Date().toISOString(),
    }
  },

  async esborrarElMeuCompte(id) {
    // Amb la migració aplicada, la funció RPC esborra l'usuari d'autenticació (i, en cascada,
    // el perfil, les llistes, els tests i les notes). Sense migració, només es pot esborrar el
    // perfil des del client i el login queda orfe.
    const { error: errRpc } = await db().rpc('eliminar_el_meu_compte')
    if (errRpc) {
      if (!esFuncioInexistent(errRpc)) throw errRpc
      const { error } = await db().from('profiles').delete().eq('id', id)
      if (error) throw error
    }
    await db().auth.signOut()
  },

  async crearGrup(nom, curs, tutorId) {
    const tutor = await perfilPerId(tutorId)
    if (!tutor) throw new Error('Tutor/a no trobat.')
    const fila = await inserirAmbCodiUnic<FilaGrup>((codi) =>
      db()
        .from('groups')
        .insert({ nom, curs, tutor_id: tutorId, codi_invitacio: codi, domini_correu: dominiDeCorreu(tutor.email) })
        .select('*')
        .single(),
    )
    return grupDesDeFila(fila)
  },

  async grupsDelTutor(tutorId) {
    const { data, error } = await db().from('groups').select('*').eq('tutor_id', tutorId)
    if (error) throw error
    return (data as FilaGrup[]).map(grupDesDeFila)
  },

  async totsElsGrups() {
    const { data, error } = await db().from('groups').select('*')
    if (error) throw error
    return (data as FilaGrup[]).map(grupDesDeFila)
  },

  async regenerarCodiInvitacio(grupId) {
    const fila = await inserirAmbCodiUnic<FilaGrup>((codi) =>
      db().from('groups').update({ codi_invitacio: codi }).eq('id', grupId).select('*').single(),
    )
    return grupDesDeFila(fila)
  },

  async eliminarGrup(grupId) {
    const { error } = await db().from('groups').delete().eq('id', grupId)
    if (error) throw error
  },

  async alumnesDelGrup(grupId) {
    const { data, error } = await db().from('profiles').select('*').eq('group_id', grupId).eq('role', 'alumne')
    if (error) throw error
    return (data as FilaPerfil[]).map(perfilDesDeFila)
  },

  async totsElsAlumnes() {
    const { data, error } = await db().from('profiles').select('*').eq('role', 'alumne')
    if (error) throw error
    return (data as FilaPerfil[]).map(perfilDesDeFila)
  },

  async totsElsTutors() {
    const { data, error } = await db().from('profiles').select('*').eq('role', 'tutor')
    if (error) throw error
    return (data as FilaPerfil[]).map(perfilDesDeFila)
  },

  async aprovarTutor(tutorId) {
    const { data, error } = await db().from('profiles').update({ tutor_aprovat: true }).eq('id', tutorId).eq('role', 'tutor').select('id')
    if (error) {
      if (error.message?.includes('tutor_aprovat')) throw new Error("Cal executar la migració 2026-10-27 a Supabase abans d'aprovar tutors.")
      throw error
    }
    if (!data?.length) throw new Error("No s'ha pogut aprovar (només un admin pot fer-ho).")
  },

  async donarDeBaixaAlumne(alumneId) {
    const { error: errRpc } = await db().rpc('eliminar_usuari', { usuari: alumneId })
    if (!errRpc) return
    if (!esFuncioInexistent(errRpc)) throw errRpc
    const { error } = await db().from('profiles').delete().eq('id', alumneId)
    if (error) throw error
  },

  async llistesDeLAlumne(studentId) {
    const { data, error } = await db().from('lists').select('*').eq('student_id', studentId)
    if (error) throw error
    return (data as FilaLlista[]).map(llistaDesDeFila)
  },

  async crearLlista(studentId, nom) {
    const { data, error } = await db().from('lists').insert({ student_id: studentId, nom }).select('*').single()
    if (error) throw error
    return llistaDesDeFila(data as FilaLlista)
  },

  async eliminarLlista(listId) {
    const { error } = await db().from('lists').delete().eq('id', listId)
    if (error) throw error
  },

  async marcarComPreinscripcio(listId) {
    const { data: llista, error: e1 } = await db().from('lists').select('student_id').eq('id', listId).single()
    if (e1) throw e1
    const { error: e2 } = await db().from('lists').update({ es_preinscripcio: false }).eq('student_id', llista.student_id)
    if (e2) throw e2
    const { error: e3 } = await db().from('lists').update({ es_preinscripcio: true }).eq('id', listId)
    if (e3) throw e3
  },

  async elementsDeLaLlista(listId) {
    const { data, error } = await db().from('list_items').select('*').eq('list_id', listId).order('posicio')
    if (error) throw error
    return (data as FilaElementLlista[]).map(elementLlistaDesDeFila)
  },

  async afegirElement(listId, estudiId, estudiTipus: EstudiTipus) {
    const { data: existents, error: e1 } = await db().from('list_items').select('*').eq('list_id', listId)
    if (e1) throw e1
    const files = (existents ?? []) as FilaElementLlista[]
    const jaHiEs = files.find((f) => f.estudi_id === estudiId)
    if (jaHiEs) return elementLlistaDesDeFila(jaHiEs)
    const posicio = files.reduce((max, f) => Math.max(max, f.posicio + 1), 0)
    const { data, error } = await db()
      .from('list_items')
      .insert({ list_id: listId, estudi_id: estudiId, estudi_tipus: estudiTipus, posicio })
      .select('*')
      .single()
    if (error) throw error
    return elementLlistaDesDeFila(data as FilaElementLlista)
  },

  async treureElement(itemId) {
    const { error } = await db().from('list_items').delete().eq('id', itemId)
    if (error) throw error
  },

  async reordenarLlista(listId, idsOrdenats) {
    const respostes = await Promise.all(
      idsOrdenats.map((id, index) => db().from('list_items').update({ posicio: index }).eq('id', id).eq('list_id', listId)),
    )
    const ambError = respostes.find((r) => r.error)
    if (ambError?.error) throw ambError.error
  },

  async desarResultatTest(studentId, testId: TestId, respostes, resultat) {
    const { data, error } = await db()
      .from('test_results')
      .insert({ student_id: studentId, test_id: testId, respostes, resultat })
      .select('*')
      .single()
    if (error) throw error
    return resultatTestDesDeFila(data as FilaResultatTest)
  },

  async resultatsDeLAlumne(studentId) {
    const { data, error } = await db().from('test_results').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
    if (error) throw error
    return (data as FilaResultatTest[]).map(resultatTestDesDeFila)
  },

  async ultimResultat(studentId, testId: TestId) {
    const { data, error } = await db()
      .from('test_results')
      .select('*')
      .eq('student_id', studentId)
      .eq('test_id', testId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data ? resultatTestDesDeFila(data as FilaResultatTest) : null
  },

  async notaDelTutor(tutorId, studentId) {
    const { data, error } = await db().from('tutor_notes').select('*').eq('tutor_id', tutorId).eq('student_id', studentId).maybeSingle()
    if (error) throw error
    return data ? notaTutorDesDeFila(data as FilaNotaTutor) : null
  },

  async desarNotaDelTutor(tutorId, studentId, contingut) {
    const { data, error } = await db()
      .from('tutor_notes')
      .upsert({ tutor_id: tutorId, student_id: studentId, contingut, updated_at: new Date().toISOString() }, { onConflict: 'tutor_id,student_id' })
      .select('*')
      .single()
    if (error) throw error
    return notaTutorDesDeFila(data as FilaNotaTutor)
  },
}
