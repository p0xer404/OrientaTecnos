import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { repo } from '../lib/repo'
import { useAuth } from '../context/useAuth'
import { useTotsEstudis } from '../data/useTotsEstudis'
import { calcularMatch, desduplicarPerNom } from '../lib/match'
import { afegirAlComparador, treureDelComparador, useComparador } from '../lib/comparador'
import { TargetaEstudi } from '../components/cercador/TargetaEstudi'
import { SelectorLlistaModal } from '../components/llistes/SelectorLlistaModal'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EstatError } from '../components/ui/Misc'
import { SkeletonRecomanacions } from '../components/ui/Skeleton'
import type { PerfilRiasec, ResultatPreferencies, ResultatRiasec } from '../types/domain'
import type { EstudiQualsevol, EstudiTipus } from '../types/estudi'

const SECCIONS: { tipus: EstudiTipus; titol: string }[] = [
  { tipus: 'grau', titol: 'Graus universitaris' },
  { tipus: 'fp', titol: 'Formació Professional' },
  { tipus: 'artistic', titol: 'Ensenyaments artístics' },
  { tipus: 'batxillerat', titol: 'Batxillerat' },
]

export default function Recomanacions() {
  const { perfil } = useAuth()
  const { estudis, error, retry } = useTotsEstudis()
  const [dominants, setDominants] = useState<PerfilRiasec[]>([])
  const [preferencies, setPreferencies] = useState<ResultatPreferencies | null>(null)
  const [feTestRiasec, setFeTestRiasec] = useState(true)
  const [estudiPerAfegir, setEstudiPerAfegir] = useState<EstudiQualsevol | null>(null)
  const comparadorActual = useComparador()
  const idsComparador = useMemo(() => new Set(comparadorActual.map((i) => i.id)), [comparadorActual])

  useEffect(() => {
    if (!perfil) return
    repo.ultimResultat(perfil.id, 'riasec').then((r) => {
      if (r) setDominants((r.resultat as ResultatRiasec).dominants)
      else setFeTestRiasec(false)
    })
    repo.ultimResultat(perfil.id, 'preferencies').then((r) => {
      if (r) setPreferencies(r.resultat as ResultatPreferencies)
    })
  }, [perfil])

  const resultats = useMemo(() => {
    if (!estudis || !perfil) return null
    const mostrarBatx = perfil.cursActual === '4t ESO'
    const calculats = estudis
      .filter((e) => (mostrarBatx ? true : e.tipus !== 'batxillerat'))
      .map((e) => ({ estudi: e, match: calcularMatch(e, { notaMitjana: perfil.notaMitjana, dominants, preferencies, interessos: perfil.interessos }) }))
      .filter((r) => r.match.puntuacio >= 40)
      .sort((a, b) => b.match.puntuacio - a.match.puntuacio)

    const perTipus: Record<EstudiTipus, typeof calculats> = { grau: [], fp: [], batxillerat: [], artistic: [] }
    for (const r of calculats) perTipus[r.estudi.tipus].push(r)
    return perTipus
  }, [estudis, perfil, dominants, preferencies])

  if (error) {
    return (
      <div className="fade-in space-y-5">
        <h1 className="text-2xl font-semibold text-ink">Les teves recomanacions</h1>
        <EstatError missatge={error} onReintentar={retry} />
      </div>
    )
  }

  if (!perfil || !estudis || !resultats) {
    return <div className="fade-in"><SkeletonRecomanacions /></div>
  }

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Les teves recomanacions</h1>
        <p className="text-sm text-muted">Calculades amb regles (sense intel·ligència artificial) a partir del teu perfil, els teus tests i les teves preferències.</p>
      </div>

      {!feTestRiasec && (
        <Card className="bg-info-bg">
          <p className="text-sm text-primary">Encara no has fet el test d'interessos (RIASEC). Fes-lo per obtenir recomanacions més precises.</p>
          <Link to="/tests/riasec"><Button mida="sm" className="mt-2">Fer el test ara</Button></Link>
        </Card>
      )}
      {!preferencies && (
        <Card className="bg-info-bg">
          <p className="text-sm text-primary">Completa el test de preferències pràctiques perquè es tingui en compte el teu pressupost i la teva disposició a desplaçar-te.</p>
          <Link to="/tests/preferencies"><Button mida="sm" className="mt-2">Fer el test ara</Button></Link>
        </Card>
      )}

      {SECCIONS.filter((s) => resultats[s.tipus].length > 0).map((s) => (
        <div key={s.tipus}>
          <h2 className="mb-3 text-lg font-semibold text-ink">{s.titol}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {desduplicarPerNom(resultats[s.tipus]).slice(0, 6).map(({ estudi, match }) => (
              <TargetaEstudi
                key={estudi.id}
                estudi={estudi}
                etiquetaMatch={match.etiqueta}
                explicacioMatch={match.explicacio}
                onAfegirALlista={() => setEstudiPerAfegir(estudi)}
                onAfegirAComparador={() => (idsComparador.has(estudi.id) ? treureDelComparador(estudi.id) : afegirAlComparador(estudi.id, estudi.tipus))}
                esAlComparador={idsComparador.has(estudi.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {Object.values(resultats).every((r) => r.length === 0) && (
        <p className="text-sm text-muted">No hem trobat cap recomanació amb una afinitat mínima. Prova a ampliar el teu pressupost o la distància en el test de preferències.</p>
      )}

      <SelectorLlistaModal estudi={estudiPerAfegir} onTancar={() => setEstudiPerAfegir(null)} />
    </div>
  )
}
