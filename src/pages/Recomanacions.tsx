import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { repo } from '../lib/repo'
import { useAuth } from '../context/useAuth'
import { useTotsEstudis } from '../data/useTotsEstudis'
import { recomanar, type Recomanacio } from '../lib/match'
import { assignarImatges } from '../lib/imatges'
import { imatgeDelCentre, useImatgesCentres } from '../lib/imatgesCentres'
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

/** Referència estable perquè el useMemo de les recomanacions no es recalculi sense motiu. */
const SENSE_DOMINANTS: PerfilRiasec[] = []

export default function Recomanacions() {
  const { perfil } = useAuth()
  const { estudis, error, retry } = useTotsEstudis()
  const [estudiPerAfegir, setEstudiPerAfegir] = useState<EstudiQualsevol | null>(null)
  const comparadorActual = useComparador()
  const idsComparador = useMemo(() => new Set(comparadorActual.map((i) => i.id)), [comparadorActual])

  // Fins que no arriben els resultats dels tests no es calcula res: si no, primer es mostraven
  // recomanacions sense perfil RIASEC i, un instant després, unes altres de diferents.
  const [tests, setTests] = useState<{
    perfilId: string
    dominants: PerfilRiasec[]
    preferencies: ResultatPreferencies | null
    feTestRiasec: boolean
    error: boolean
  } | null>(null)
  const idPerfil = perfil?.id

  useEffect(() => {
    if (!idPerfil) return
    let viu = true
    Promise.all([repo.ultimResultat(idPerfil, 'riasec'), repo.ultimResultat(idPerfil, 'preferencies')])
      .then(([riasec, prefs]) => {
        if (!viu) return
        setTests({
          perfilId: idPerfil,
          dominants: riasec ? (riasec.resultat as ResultatRiasec).dominants : [],
          preferencies: prefs ? (prefs.resultat as ResultatPreferencies) : null,
          feTestRiasec: Boolean(riasec),
          error: false,
        })
      })
      .catch(() => {
        if (viu) setTests({ perfilId: idPerfil, dominants: [], preferencies: null, feTestRiasec: true, error: true })
      })
    return () => {
      viu = false
    }
  }, [idPerfil])

  const testsActuals = tests && tests.perfilId === idPerfil ? tests : null
  const carregantTests = !testsActuals
  const dominants = testsActuals?.dominants ?? SENSE_DOMINANTS
  const preferencies = testsActuals?.preferencies ?? null
  const feTestRiasec = testsActuals?.feTestRiasec ?? true
  const errorTests = testsActuals?.error ?? false

  const resultats = useMemo(() => {
    if (!estudis || !perfil || carregantTests) return null
    const mostrarBatx = perfil.cursActual === '4t ESO'
    const entrada = { notaMitjana: perfil.notaMitjana, dominants, preferencies, interessos: perfil.interessos }
    const perTipus: Record<EstudiTipus, Recomanacio[]> = { grau: [], fp: [], batxillerat: [], artistic: [] }
    for (const s of SECCIONS) {
      if (s.tipus === 'batxillerat' && !mostrarBatx) continue
      perTipus[s.tipus] = recomanar(
        estudis.filter((e) => e.tipus === s.tipus),
        entrada,
        6,
      )
    }
    return perTipus
  }, [estudis, perfil, dominants, preferencies, carregantTests])

  const imatgesCentres = useImatgesCentres()
  const imatges = useMemo(
    () =>
      assignarImatges(
        resultats ? SECCIONS.flatMap((s) => resultats[s.tipus].map((r) => r.estudi)) : [],
        (e) => imatgeDelCentre(e, imatgesCentres),
      ),
    [resultats, imatgesCentres],
  )

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

      {errorTests && (
        <Card className="bg-warning-bg">
          <p className="text-sm text-warning">No s'han pogut carregar els resultats dels teus tests: les recomanacions es calculen només amb el teu perfil.</p>
        </Card>
      )}
      {!feTestRiasec && !errorTests && (
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
            {resultats[s.tipus].map(({ estudi, match }) => (
              <TargetaEstudi
                key={estudi.id}
                estudi={estudi}
                imatge={imatges.get(estudi.id)}
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
