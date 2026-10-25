import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { repo } from '../lib/repo'
import { useAuth } from '../context/useAuth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Checkbox, Label, Select, TextInput } from '../components/ui/Forms'
import { ETIQUETES_ESTAT_DECISIO, type EstatDecisio, type ResultatTest, type TestId } from '../types/domain'
import { AREES_INTERES, NOM_PERFIL } from '../lib/riasec/mapping'
import type { ResultatPreferencies, ResultatRiasec } from '../types/domain'

const TESTS: { id: TestId; nom: string }[] = [
  { id: 'riasec', nom: "Interessos (RIASEC)" },
  { id: 'habilitats', nom: 'Habilitats percebudes' },
  { id: 'preferencies', nom: 'Preferències pràctiques' },
]

export default function Perfil() {
  const { perfil, logout, refrescar } = useAuth()
  const navigate = useNavigate()
  const [notaMitjana, setNotaMitjana] = useState('')
  const [interessos, setInteressos] = useState<string[]>([])
  const [resultats, setResultats] = useState<ResultatTest[]>([])
  const [desant, setDesant] = useState(false)
  const [errorNota, setErrorNota] = useState<string | null>(null)
  const [desat, setDesat] = useState(false)
  const [confirmarEsborrat, setConfirmarEsborrat] = useState(false)

  useEffect(() => {
    if (!perfil) return
    setNotaMitjana(perfil.notaMitjana?.toString() ?? '')
    setInteressos(perfil.interessos.filter((i) => (AREES_INTERES as readonly string[]).includes(i)))
    repo.resultatsDeLAlumne(perfil.id).then(setResultats)
  }, [perfil])

  if (!perfil) return null

  async function desar() {
    // Accepta "7,5" (coma decimal) i comprova el rang: abans, una coma deixava el camp buit i
    // es desava null (s'esborrava la nota) i un "75" es desava tal qual.
    const text = notaMitjana.trim().replace(',', '.')
    const nota = text === '' ? null : Number(text)
    if (nota != null && (!Number.isFinite(nota) || nota < 0 || nota > 10)) {
      setErrorNota('La nota mitjana ha de ser un número entre 0 i 10.')
      return
    }
    setErrorNota(null)
    setDesat(false)
    setDesant(true)
    try {
      await repo.actualitzarPerfil(perfil!.id, {
        notaMitjana: nota == null ? null : Math.round(nota * 100) / 100,
        interessos,
      })
      await refrescar()
      setDesat(true)
    } catch {
      setErrorNota("No s'han pogut desar els canvis. Torna-ho a provar.")
    } finally {
      setDesant(false)
    }
  }

  function alternarInteres(area: string) {
    setDesat(false)
    setInteressos((actuals) => (actuals.includes(area) ? actuals.filter((a) => a !== area) : [...actuals, area]))
  }

  async function canviarEstat(estat: EstatDecisio) {
    await repo.actualitzarEstatDecisio(perfil!.id, estat)
    await refrescar()
  }

  async function descarregar() {
    const dades = await repo.descarregarLesMevesDades(perfil!.id)
    const blob = new Blob([JSON.stringify(dades, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `les-meves-dades-${perfil!.nom.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    // Revocar l'URL a l'instant pot cancel·lar la descàrrega en alguns navegadors.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function esborrarCompte() {
    await repo.esborrarElMeuCompte(perfil!.id)
    await logout()
    navigate('/')
  }

  const resultatRiasec = resultats.find((r) => r.testId === 'riasec')
  // Els resultats vénen del més recent al més antic. Per a les matèries es busca l'últim que
  // en tingui (el test de preferències de /tests no les pregunta i no les ha d'amagar).
  const resultatPreferencies = resultats.find(
    (r) => r.testId === 'preferencies' && (r.resultat as ResultatPreferencies).materiesBones !== undefined,
  )?.resultat as ResultatPreferencies | undefined
  const fets = new Set(resultats.map((r) => r.testId))
  const teMateries =
    resultatPreferencies &&
    ((resultatPreferencies.materiesBones?.length ?? 0) > 0 ||
      (resultatPreferencies.materiesFluixes?.length ?? 0) > 0 ||
      (resultatPreferencies.materiesPreferides?.length ?? 0) > 0 ||
      (resultatPreferencies.materiesMenysPreferides?.length ?? 0) > 0)

  return (
    <div className="fade-in mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-xl font-semibold text-primary-contrast">
          {perfil.nom.trim().charAt(0).toUpperCase() || '?'}
        </span>
        <div>
          <p className="eyebrow">El meu perfil</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{perfil.nom}</h1>
        </div>
      </div>

      <Card className="space-y-3 border-t-4 border-t-primary">
        <p className="text-sm text-muted">Curs actual</p>
        <p className="font-medium text-ink">{perfil.cursActual ?? 'Consulta-ho al centre'}</p>

        <div>
          <Label htmlFor="nota">Nota mitjana (sobre 10)</Label>
          <TextInput
            id="nota"
            inputMode="decimal"
            value={notaMitjana}
            onChange={(e) => {
              setDesat(false)
              setNotaMitjana(e.target.value)
            }}
            placeholder="Ex: 7,5"
            aria-invalid={errorNota ? true : undefined}
            aria-describedby={errorNota ? 'nota-error' : undefined}
          />
          {errorNota && <p id="nota-error" role="alert" className="mt-1 text-xs text-warning">{errorNota}</p>}
        </div>
        <fieldset>
          <legend className="mb-1 text-sm font-medium text-ink">Àrees que t'interessen</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {AREES_INTERES.map((area) => (
              <Checkbox key={area} label={area} checked={interessos.includes(area)} onChange={() => alternarInteres(area)} />
            ))}
          </div>
        </fieldset>
        <div className="flex items-center gap-3">
          <Button onClick={desar} disabled={desant}>{desant ? 'Desant…' : 'Desa els canvis'}</Button>
          {desat && <span role="status" className="fade-in text-sm text-success">✓ Desat</span>}
        </div>
      </Card>

      <Card className="border-t-4 border-t-accent">
        <Label htmlFor="estat">Estat de la decisió</Label>
        <Select id="estat" value={perfil.estatDecisio} onChange={(e) => canviarEstat(e.target.value as EstatDecisio)}>
          {Object.entries(ETIQUETES_ESTAT_DECISIO).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>{etiqueta}</option>
          ))}
        </Select>
      </Card>

      <Card className="border-t-4 border-t-primary">
        <h2 className="mb-2 font-semibold text-ink">Els meus tests</h2>
        {resultatRiasec && (
          <p className="mb-3 text-sm text-ink">
            Perfil RIASEC dominant: <strong>{(resultatRiasec.resultat as ResultatRiasec).dominants.map((p) => NOM_PERFIL[p]).join(' / ')}</strong>
          </p>
        )}
        <ul className="space-y-2">
          {TESTS.map((t) => (
            <li key={t.id} className="flex items-center justify-between text-sm">
              <span className="text-ink">{t.nom}</span>
              {fets.has(t.id) ? <Badge tipus="success">Fet</Badge> : <Link to={`/tests/${t.id}`} className="text-primary underline">Fer-lo</Link>}
            </li>
          ))}
        </ul>
      </Card>

      {teMateries && (
        <Card className="border-t-4 border-t-accent">
          <h2 className="mb-2 font-semibold text-ink">Les teves matèries</h2>
          <p className="mb-3 text-xs text-muted">
            Això ho vas respondre al qüestionari inicial. Pots actualitzar-ho <Link to="/benvinguda" className="text-primary underline">tornant-lo a fer</Link>.
          </p>
          <dl className="space-y-2 text-sm">
            {!!resultatPreferencies?.materiesBones?.length && (
              <div><dt className="text-muted">Hi treus bona nota</dt><dd className="text-ink">{resultatPreferencies.materiesBones.join(', ')}</dd></div>
            )}
            {!!resultatPreferencies?.materiesFluixes?.length && (
              <div><dt className="text-muted">Hi treus pitjor nota</dt><dd className="text-ink">{resultatPreferencies.materiesFluixes.join(', ')}</dd></div>
            )}
            {!!resultatPreferencies?.materiesPreferides?.length && (
              <div><dt className="text-muted">T'agraden més</dt><dd className="text-ink">{resultatPreferencies.materiesPreferides.join(', ')}</dd></div>
            )}
            {!!resultatPreferencies?.materiesMenysPreferides?.length && (
              <div><dt className="text-muted">T'agraden menys</dt><dd className="text-ink">{resultatPreferencies.materiesMenysPreferides.join(', ')}</dd></div>
            )}
          </dl>
        </Card>
      )}

      <Card className="space-y-3 border-t-4 border-t-warning">
        <h2 className="font-semibold text-ink">Les meves dades</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={descarregar}>Descarregar les meves dades</Button>
          {!confirmarEsborrat ? (
            <Button variant="danger" onClick={() => setConfirmarEsborrat(true)}>Esborrar el meu compte</Button>
          ) : (
            <div className="fade-in flex flex-wrap items-center gap-2">
              <span className="text-sm text-warning">Això eliminarà totes les teves dades de manera permanent. N'estàs segur/a?</span>
              <Button variant="danger" onClick={esborrarCompte}>Sí, esborra-ho tot</Button>
              <Button variant="ghost" onClick={() => setConfirmarEsborrat(false)}>Cancel·la</Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
