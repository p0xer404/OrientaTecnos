import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTotsEstudis } from '../data/useTotsEstudis'
import { formatKm, formatNota, formatPreu } from '../lib/format'
import { tr } from '../lib/traduccio'
import { afegirAlComparador, treureDelComparador, useComparador } from '../lib/comparador'
import { useAuth } from '../context/useAuth'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EstatError } from '../components/ui/Misc'
import { SkeletonFitxa } from '../components/ui/Skeleton'
import { GraficNota } from '../components/fitxa/GraficNota'
import { MapaCentre } from '../components/fitxa/MapaCentre'
import { TargetaEstudi } from '../components/cercador/TargetaEstudi'
import { SelectorLlistaModal } from '../components/llistes/SelectorLlistaModal'
import { IconGlobe, IconMail, IconPhone } from '../components/ui/Icons'
import type { EstudiQualsevol } from '../types/estudi'
import { separarFont, textWeb, urlExterna } from '../lib/url'
import NotFound from './NotFound'

function ContacteCentre({ telefono, email, web: webOriginal }: { telefono?: string | null; email?: string | null; web?: string | null }) {
  const web = urlExterna(webOriginal)
  if (!telefono && !email && !web) return <p className="text-sm text-muted">Consulta-ho al centre.</p>
  return (
    <ul className="space-y-2 text-sm">
      {telefono && <li className="flex items-center gap-2"><IconPhone className="shrink-0 text-muted" /><a className="text-primary underline" href={`tel:${telefono}`}>{telefono}</a></li>}
      {email && <li className="flex items-center gap-2"><IconMail className="shrink-0 text-muted" /><a className="text-primary underline" href={`mailto:${email}`}>{email}</a></li>}
      {web && <li className="flex items-center gap-2"><IconGlobe className="shrink-0 text-muted" /><a className="text-primary underline" href={web} target="_blank" rel="noreferrer">{textWeb(web)}</a></li>}
    </ul>
  )
}

function explicacioAdmissio(admissio: string): string {
  if (admissio.includes('PAP')) {
    return "Aquest estudi requereix superar una Prova d'Aptitud Personal (PAP) pròpia del centre, a més de la preinscripció universitària. Consulta el calendari i el contingut de la prova a la web del centre."
  }
  if (admissio.includes('Pròpia')) {
    return 'Aquest centre té un procés d\'admissió propi (sense nota de tall): normalment una sol·licitud, una entrevista i/o proves específiques directament amb el centre.'
  }
  return 'Aquest estudi s\'adjudica per preinscripció universitària: les places es reparteixen per nota d\'admissió fins que s\'exhaureixen.'
}

export default function EstudiDetall() {
  const { id } = useParams()
  const { perfil } = useAuth()
  const { estudis, error, retry } = useTotsEstudis()
  const [estudiPerAfegir, setEstudiPerAfegir] = useState<EstudiQualsevol | null>(null)
  const [missatge, setMissatge] = useState<string | null>(null)
  const temporitzadorMissatge = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(temporitzadorMissatge.current), [])

  const estudi = useMemo(() => estudis?.find((e) => e.id === id) ?? null, [estudis, id])

  const similars = useMemo(() => {
    if (!estudis || !estudi) return []
    const candidats = estudis
      .filter((e) => e.id !== estudi.id && e.nom !== estudi.nom && e.tipus === estudi.tipus && e.area === estudi.area)
      .sort((a, b) => {
        if (estudi.notaTall2026 != null) return Math.abs((a.notaTall2026 ?? 99) - estudi.notaTall2026) - Math.abs((b.notaTall2026 ?? 99) - estudi.notaTall2026)
        return (a.kmTerrassa ?? 999) - (b.kmTerrassa ?? 999)
      })
    const vistos = new Set<string>()
    const resultat: EstudiQualsevol[] = []
    for (const c of candidats) {
      if (vistos.has(c.nom)) continue
      vistos.add(c.nom)
      resultat.push(c)
      if (resultat.length === 4) break
    }
    return resultat
  }, [estudis, estudi])

  const comparadorActual = useComparador()

  if (error) return <div className="fade-in"><EstatError missatge={error} onReintentar={retry} /></div>
  if (!estudis) return <div className="fade-in"><SkeletonFitxa /></div>
  if (!estudi) return <NotFound />

  const esAlComparador = comparadorActual.some((i) => i.id === estudi.id)

  function comparar() {
    if (esAlComparador) {
      treureDelComparador(estudi!.id)
      setMissatge('Tret del comparador.')
    } else {
      const res = afegirAlComparador(estudi!.id, estudi!.tipus)
      setMissatge(res.ok ? 'Afegit al comparador.' : res.motiu ?? null)
    }
    window.clearTimeout(temporitzadorMissatge.current)
    temporitzadorMissatge.current = window.setTimeout(() => setMissatge(null), 3000)
  }

  return (
    <div className="fade-in space-y-5">
      <div>
        {estudi.destacat && <Badge tipus="accent">Destacat</Badge>}
        <h1 className="mt-1 text-2xl font-semibold text-ink">{estudi.nom}</h1>
        <p className="text-muted">{estudi.subtitol}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge>{estudi.municipi}</Badge>
          <Badge>{estudi.titularitat}</Badge>
          {estudi.notaTall2026 != null && <Badge tipus="info">Nota de tall {formatNota(estudi.notaTall2026)}</Badge>}
          {estudi.kmTerrassa != null && <Badge>{formatKm(estudi.kmTerrassa)} de Terrassa</Badge>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {perfil?.rol === 'alumne' && (
            <Button variant="secondary" mida="sm" onClick={() => setEstudiPerAfegir(estudi)}>+ Afegir a una llista</Button>
          )}
          <Button variant={esAlComparador ? 'primary' : 'secondary'} mida="sm" onClick={comparar}>
            {esAlComparador ? '✓ Al comparador' : '+ Afegir al comparador'}
          </Button>
        </div>
        {missatge && <p role="status" className="entra-dalt mt-2 text-sm text-primary">{missatge}</p>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <Card>
            <h2 className="mb-2 font-semibold text-ink">Preu</h2>
            <p className="text-lg font-semibold text-ink">{formatPreu(estudi.preu)}</p>
            {estudi.preuRef && <p className="text-sm text-muted">Curs de referència: {estudi.preuRef}.</p>}
            {estudi.preuNota && <p className="mt-1 text-sm text-muted">{estudi.preuNota}</p>}
            {estudi.tipus === 'grau' && estudi.raw.precio_fuente && (() => {
              const font = separarFont(estudi.raw.precio_fuente)
              return (
                <div className="mt-1 space-y-0.5">
                  {font.text && <p className="text-xs text-muted">Font: {font.text}.</p>}
                  {font.url && <a href={font.url} target="_blank" rel="noreferrer" className="inline-block text-sm text-primary underline">Veure font oficial</a>}
                </div>
              )
            })()}
          </Card>

          {estudi.tipus === 'grau' && (
            <Card>
              <h2 className="mb-2 font-semibold text-ink">Evolució de la nota de tall</h2>
              <GraficNota
                dades={[
                  { curs: '2023', nota: estudi.raw.nota_corte_2023 },
                  { curs: '2024', nota: estudi.raw.nota_corte_2024 },
                  { curs: '2025', nota: estudi.raw.nota_corte_2025 },
                  { curs: '2026', nota: estudi.raw.nota_corte_2026 },
                ]}
              />
              <p className="mt-2 text-sm text-muted">{explicacioAdmissio(tr(estudi.raw.admision))}</p>
              {(estudi.raw.idiomas || estudi.raw.duracion) && (
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {estudi.raw.duracion && <div><dt className="text-muted">Durada</dt><dd className="text-ink">{tr(estudi.raw.duracion)}</dd></div>}
                  {estudi.raw.idiomas && <div><dt className="text-muted">Idiomes</dt><dd className="text-ink">{tr(estudi.raw.idiomas)}</dd></div>}
                </dl>
              )}
              {estudi.places != null && <p className="mt-2 text-sm text-muted">{estudi.places} places de nou accés.</p>}
              {estudi.id === 'pre-5067' && (
                <Link to="/estudi/art-escac" className="mt-2 inline-block text-sm text-primary underline">Veure la fitxa completa de l'ESCAC →</Link>
              )}
            </Card>
          )}

          {estudi.tipus === 'fp' && (
            <Card>
              <h2 className="mb-2 font-semibold text-ink">Dades del cicle</h2>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div><dt className="text-muted">Nivell</dt><dd className="text-ink">{tr(estudi.raw.nivel)}</dd></div>
                <div><dt className="text-muted">Família</dt><dd className="text-ink">{estudi.raw.familia}</dd></div>
                {estudi.raw.horas != null && <div><dt className="text-muted">Hores</dt><dd className="text-ink">{estudi.raw.horas} h</dd></div>}
                <div><dt className="text-muted">Modalitat</dt><dd className="text-ink">{estudi.raw.modalidad}</dd></div>
              </dl>
              <p className="mt-3 text-sm text-muted">L'accés no té nota de tall: s'hi accedeix amb l'ESO (grau mitjà) o amb el Batxillerat o un grau mitjà (grau superior); en cas de més demanda que places, s'ordena per barem acadèmic.</p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {urlExterna(estudi.raw.preinscripcion) && <a href={urlExterna(estudi.raw.preinscripcion)!} target="_blank" rel="noreferrer" className="text-primary underline">Preinscripció</a>}
                {urlExterna(estudi.raw.info) && <a href={urlExterna(estudi.raw.info)!} target="_blank" rel="noreferrer" className="text-primary underline">Més informació</a>}
              </div>
            </Card>
          )}

          {estudi.tipus === 'batxillerat' && (
            <Card>
              <h2 className="mb-2 font-semibold text-ink">Modalitats i alumnat</h2>
              <p className="text-sm text-muted">
                A Catalunya, el "tecnològic" no és una modalitat a part: forma part de Ciències i Tecnologia (cada centre ofereix els seus itineraris). Arts inclou Arts plàstiques, imatge i disseny i/o Música i arts escèniques segons el centre.
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {Object.entries(estudi.raw.alumnos_por_modalidad).map(([modalitat, alumnes]) => (
                  <li key={modalitat} className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2">
                    <span className="text-ink">{modalitat}</span>
                    <span className="text-muted">1r: {alumnes['1o'] ?? '—'} · 2n: {alumnes['2o'] ?? '—'}</span>
                  </li>
                ))}
              </ul>
              {estudi.raw.curso_datos_matricula && <p className="mt-2 text-xs text-muted">Dades de matrícula del curs {estudi.raw.curso_datos_matricula}.</p>}
              {estudi.raw.ocupacion_preinscripcion != null && (
                <p className="mt-3 text-sm">
                  {estudi.raw.ocupacion_preinscripcion >= 0.95 ? (
                    <Badge tipus="warning">Molt sol·licitat</Badge>
                  ) : (
                    <Badge tipus="info">Demanda moderada</Badge>
                  )}{' '}
                  <span className="text-muted">({Math.round(estudi.raw.ocupacion_preinscripcion * 100)}% de les places assignades a la preinscripció {estudi.raw.curso_datos_oferta ?? 'del curs anterior'}).</span>
                </p>
              )}
            </Card>
          )}

          {estudi.tipus === 'artistic' && (
            <Card>
              <h2 className="mb-2 font-semibold text-ink">Admissió i especialitats</h2>
              <p className="text-sm text-ink">{tr(estudi.raw.admision)}</p>
              <p className="mt-2 text-sm text-muted">
                Un títol superior artístic equival a un grau (admissió per prova específica, no compta la PAU); és diferent d'un grau universitari i també d'un cicle superior artístic, que és FP d'arts plàstiques i disseny o d'arts escèniques.
              </p>
              {estudi.raw.especialidades.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-sm font-medium text-ink">Especialitats</p>
                  <div className="flex flex-wrap gap-1.5">
                    {estudi.raw.especialidades.map((e) => <Badge key={e}>{tr(e)}</Badge>)}
                  </div>
                </div>
              )}
              {estudi.raw.ciclos_superiores_artisticos.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-sm font-medium text-ink">Cicles de grau superior oferts</p>
                  <div className="flex flex-wrap gap-1.5">
                    {estudi.raw.ciclos_superiores_artisticos.map((c) => <Badge key={c}>{c}</Badge>)}
                  </div>
                </div>
              )}
              {estudi.id === 'art-escac' && (
                <Link to="/estudi/pre-5067" className="mt-3 inline-block text-sm text-primary underline">Veure el grau oficial de Cinematografia (preinscripció) →</Link>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <h2 className="mb-2 font-semibold text-ink">Contacte</h2>
            {estudi.tipus === 'grau' ? (
              urlExterna(estudi.raw.url) ? <a href={urlExterna(estudi.raw.url)!} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Web del centre</a> : <p className="text-sm text-muted">Consulta-ho al centre.</p>
            ) : (
              <ContacteCentre telefono={'telefono' in estudi.raw ? estudi.raw.telefono : null} email={'email' in estudi.raw ? estudi.raw.email : null} web={'web' in estudi.raw ? estudi.raw.web : null} />
            )}
          </Card>

          <Card>
            <h2 className="mb-2 font-semibold text-ink">Ubicació</h2>
            {estudi.lat != null && estudi.lon != null ? (
              <MapaCentre lat={estudi.lat} lon={estudi.lon} nom={estudi.centre} />
            ) : (
              <p className="text-sm text-muted">Consulta-ho al centre (aquest estudi no té coordenades disponibles a les dades oficials).</p>
            )}
            {'direccion' in estudi.raw && estudi.raw.direccion && <p className="mt-2 text-sm text-muted">{estudi.raw.direccion}, {estudi.municipi}</p>}
          </Card>
        </div>
      </div>

      {similars.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ink">Estudis similars</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {similars.map((e) => (
              <TargetaEstudi
                key={e.id}
                estudi={e}
                onAfegirALlista={perfil?.rol === 'alumne' ? () => setEstudiPerAfegir(e) : undefined}
                onAfegirAComparador={() => (comparadorActual.some((i) => i.id === e.id) ? treureDelComparador(e.id) : afegirAlComparador(e.id, e.tipus))}
                esAlComparador={comparadorActual.some((i) => i.id === e.id)}
              />
            ))}
          </div>
        </div>
      )}

      <SelectorLlistaModal estudi={estudiPerAfegir} onTancar={() => setEstudiPerAfegir(null)} />
    </div>
  )
}
