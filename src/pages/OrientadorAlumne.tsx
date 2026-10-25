import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { repo } from '../lib/repo'
import { useAuth } from '../context/useAuth'
import { ESTUDIS_BUIT, useTotsEstudis } from '../data/useTotsEstudis'
import { calcularMatch, desduplicarPerNom } from '../lib/match'
import { NOM_PERFIL } from '../lib/riasec/mapping'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { SkeletonFitxa } from '../components/ui/Skeleton'
import { ETIQUETES_ESTAT_DECISIO } from '../types/domain'
import type { ElementLlista, Llista, Perfil, PerfilRiasec, ResultatPreferencies, ResultatRiasec, ResultatTest } from '../types/domain'
import type { EstudiQualsevol } from '../types/estudi'
import NotFound from './NotFound'

function generarResumPlantilla(alumne: Perfil, dominants: PerfilRiasec[], topEstudis: EstudiQualsevol[]): string {
  const nomsPerfil = dominants.map((p) => NOM_PERFIL[p])
  const fraseInteres =
    nomsPerfil.length > 0
      ? `té un perfil ${nomsPerfil.join(' i ')}`
      : 'encara no ha fet el test d\'interessos'
  const fraseDecisio =
    alumne.estatDecisio === 'ho_tinc_clar'
      ? 'i ja té clar quin camí vol seguir'
      : alumne.estatDecisio === 'tinc_opcions'
        ? 'i ja té algunes opcions sobre la taula, però encara no ho ha decidit del tot'
        : 'i encara no ha decidit quins estudis vol fer'
  const fraseCompatible =
    topEstudis.length > 0
      ? ` El seu perfil és compatible amb ${topEstudis.slice(0, 3).map((e) => e.nom).join(', ')}.`
      : ''
  return `${alumne.nom} ${fraseInteres}, ${fraseDecisio}.${fraseCompatible}`
}

export default function OrientadorAlumne() {
  const { id } = useParams()
  const { perfil: tutor } = useAuth()
  // undefined = carregant, null = no existeix o no hi tens accés
  const [alumne, setAlumne] = useState<Perfil | null | undefined>(undefined)
  const [resultats, setResultats] = useState<ResultatTest[]>([])
  const [llistes, setLlistes] = useState<Llista[]>([])
  const [elements, setElements] = useState<Record<string, ElementLlista[]>>({})
  const { estudis: estudisOrNull } = useTotsEstudis()
  const estudis = estudisOrNull ?? ESTUDIS_BUIT
  const [nota, setNota] = useState('')
  const [desant, setDesant] = useState(false)
  const [estatNota, setEstatNota] = useState<'desat' | 'error' | null>(null)

  useEffect(() => {
    if (!id || !tutor) return
    let actiu = true
    setAlumne(undefined)
    ;(async () => {
      try {
        const [perfilAlumne, grupsTutor] = await Promise.all([
          repo.obtenirPerfil(id),
          tutor.rol === 'tutor' ? repo.grupsDelTutor(tutor.id) : Promise.resolve(null),
        ])
        // Un tutor només pot veure alumnes dels seus grups (a Supabase ho garanteix RLS; al
        // mode demo, aquí).
        const accessible =
          perfilAlumne?.rol === 'alumne' &&
          (grupsTutor === null || grupsTutor.some((g) => g.id === perfilAlumne.groupId))
        if (!actiu) return
        setAlumne(accessible ? perfilAlumne : null)
        if (!accessible) return
        const [res, ls] = await Promise.all([repo.resultatsDeLAlumne(id), repo.llistesDeLAlumne(id)])
        const parells = await Promise.all(ls.map(async (l) => [l.id, await repo.elementsDeLaLlista(l.id)] as const))
        if (!actiu) return
        setResultats(res)
        setLlistes(ls)
        setElements(Object.fromEntries(parells))
      } catch {
        if (actiu) setAlumne(null)
      }
    })()
    return () => {
      actiu = false
    }
  }, [id, tutor])

  useEffect(() => {
    if (!tutor || !id) return
    repo.notaDelTutor(tutor.id, id).then((n) => setNota(n?.contingut ?? ''))
  }, [tutor, id])

  const estudisPerId = useMemo(() => Object.fromEntries(estudis.map((e) => [e.id, e])), [estudis])
  const resultatRiasec = resultats.find((r) => r.testId === 'riasec')?.resultat as ResultatRiasec | undefined
  const resultatPreferencies = resultats.find((r) => r.testId === 'preferencies')?.resultat as ResultatPreferencies | undefined
  const resultatMateries = resultats.find(
    (r) => r.testId === 'preferencies' && (r.resultat as ResultatPreferencies).materiesBones !== undefined,
  )?.resultat as ResultatPreferencies | undefined

  const recomanacions = useMemo(() => {
    if (!alumne || estudis.length === 0) return []
    const calculats = estudis
      .map((e) => ({ estudi: e, match: calcularMatch(e, { notaMitjana: alumne.notaMitjana, dominants: resultatRiasec?.dominants ?? [], preferencies: resultatPreferencies ?? null, interessos: alumne.interessos }) }))
      .sort((a, b) => b.match.puntuacio - a.match.puntuacio)
    return desduplicarPerNom(calculats).slice(0, 5)
  }, [alumne, estudis, resultatRiasec, resultatPreferencies])

  if (alumne === undefined) return <div className="fade-in"><SkeletonFitxa /></div>
  if (alumne === null) return <NotFound />

  async function desarNota() {
    if (!tutor || !id) return
    setDesant(true)
    setEstatNota(null)
    try {
      await repo.desarNotaDelTutor(tutor.id, id, nota)
      setEstatNota('desat')
    } catch {
      setEstatNota('error')
    } finally {
      setDesant(false)
    }
  }

  const resum = generarResumPlantilla(alumne, resultatRiasec?.dominants ?? [], recomanacions.map((r) => r.estudi))

  return (
    <div className="fade-in space-y-5">
      <div>
        <Link to="/orientador" className="text-sm text-primary underline">← Tornar al grup</Link>
        <p className="eyebrow mt-2">Fitxa de l'alumne/a</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">{alumne.nom}</h1>
        <p className="text-sm text-muted">{alumne.cursActual} · {alumne.email}</p>
      </div>

      <Card className="fade-in bg-info-bg">
        <p className="text-sm text-primary">{resum}</p>
        <p className="mt-1 text-xs text-primary/80">Resum generat automàticament a partir de plantilles (sense intel·ligència artificial).</p>
      </Card>

      <div className="stagger grid gap-4 sm:grid-cols-3">
        <Card className="border-t-4 border-t-primary"><p className="text-sm text-muted">Nota mitjana</p><p className="text-lg font-semibold text-ink">{alumne.notaMitjana ?? 'Consulta-ho al centre'}</p></Card>
        <Card className="border-t-4 border-t-accent"><p className="text-sm text-muted">Estat de decisió</p><Badge>{ETIQUETES_ESTAT_DECISIO[alumne.estatDecisio]}</Badge></Card>
        <Card className="border-t-4 border-t-primary"><p className="text-sm text-muted">Perfil RIASEC</p><p className="text-sm font-medium text-ink">{resultatRiasec?.dominants.map((p) => NOM_PERFIL[p]).join(' / ') ?? 'No fet'}</p></Card>
      </div>

      <Card>
        <h2 className="mb-2 font-semibold text-ink">Llistes de l'alumne</h2>
        {llistes.length === 0 ? (
          <p className="text-sm text-muted">Encara no ha creat cap llista.</p>
        ) : (
          <div className="space-y-3">
            {llistes.map((l) => (
              <div key={l.id}>
                <p className="text-sm font-medium text-ink">{l.nom} {l.esPreinscripcio && <Badge tipus="accent">Preinscripció</Badge>}</p>
                <ul className="mt-1 space-y-0.5 text-sm text-muted">
                  {(elements[l.id] ?? []).map((el) => (
                    <li key={el.id}>
                      {estudisPerId[el.estudiId] ? (
                        <Link to={`/estudi/${el.estudiId}`} className="hover:text-primary">{estudisPerId[el.estudiId].nom}</Link>
                      ) : 'Estudi no disponible'}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>

      {resultatMateries && (resultatMateries.materiesBones?.length || resultatMateries.materiesFluixes?.length || resultatMateries.materiesPreferides?.length || resultatMateries.materiesMenysPreferides?.length) ? (
        <Card>
          <h2 className="mb-2 font-semibold text-ink">Matèries (declarades en registrar-se)</h2>
          <dl className="space-y-2 text-sm">
            {!!resultatMateries.materiesBones?.length && (
              <div><dt className="text-muted">Hi treu bona nota</dt><dd className="text-ink">{resultatMateries.materiesBones.join(', ')}</dd></div>
            )}
            {!!resultatMateries.materiesFluixes?.length && (
              <div><dt className="text-muted">Hi treu pitjor nota</dt><dd className="text-ink">{resultatMateries.materiesFluixes.join(', ')}</dd></div>
            )}
            {!!resultatMateries.materiesPreferides?.length && (
              <div><dt className="text-muted">Li agraden més</dt><dd className="text-ink">{resultatMateries.materiesPreferides.join(', ')}</dd></div>
            )}
            {!!resultatMateries.materiesMenysPreferides?.length && (
              <div><dt className="text-muted">Li agraden menys</dt><dd className="text-ink">{resultatMateries.materiesMenysPreferides.join(', ')}</dd></div>
            )}
          </dl>
        </Card>
      ) : null}

      <Card>
        <h2 className="mb-2 font-semibold text-ink">Recomanacions calculades</h2>
        <ul className="space-y-1 text-sm">
          {recomanacions.map(({ estudi, match }) => (
            <li key={estudi.id} className="flex justify-between">
              <Link to={`/estudi/${estudi.id}`} className="text-ink hover:text-primary">{estudi.nom}</Link>
              <Badge tipus={match.etiqueta === 'Match' ? 'accent' : 'info'}>{match.puntuacio}/100</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold text-ink">Notes privades del tutor/a</h2>
        <textarea
          value={nota}
          onChange={(e) => {
            setEstatNota(null)
            setNota(e.target.value)
          }}
          aria-label="Notes privades del tutor/a"
          rows={4}
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
          placeholder="Notes visibles només per a tutors/es, mai per l'alumne."
        />
        <div className="mt-2 flex items-center gap-3">
          <Button mida="sm" onClick={desarNota} disabled={desant}>{desant ? 'Desant…' : 'Desa la nota'}</Button>
          {estatNota === 'desat' && <span role="status" className="fade-in text-sm text-success">✓ Nota desada</span>}
          {estatNota === 'error' && <span role="alert" className="fade-in text-sm text-warning">No s'ha pogut desar.</span>}
        </div>
      </Card>
    </div>
  )
}
