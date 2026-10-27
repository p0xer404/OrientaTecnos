import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { repo } from '../lib/repo'
import { useAuth } from '../context/useAuth'
import { ESTUDIS_BUIT, useTotsEstudis } from '../data/useTotsEstudis'
import { NOM_PERFIL } from '../lib/riasec/mapping'
import { Card } from '../components/ui/Card'
import { Label, Select, TextInput } from '../components/ui/Forms'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SkeletonOrientadorDashboard } from '../components/ui/Skeleton'
import { TaulaAccessible } from '../components/ui/TaulaAccessible'
import { ETIQUETES_ESTAT_DECISIO } from '../types/domain'
import type { ElementLlista, Grup, Perfil, PerfilRiasec, ResultatRiasec } from '../types/domain'

const COLORS_RIASEC = ['#5a3a22', '#b1552e', '#4c7a3d', '#9a6a1f', '#7a5a8a', '#826b4f']

export default function OrientadorDashboard() {
  const { perfil } = useAuth()
  const [grups, setGrups] = useState<Grup[] | null>(null)
  const [grupId, setGrupId] = useState<string>('')
  const [alumnes, setAlumnes] = useState<Perfil[]>([])
  const [resultatsRiasec, setResultatsRiasec] = useState<Record<string, ResultatRiasec>>({})
  const [elementsPerAlumne, setElementsPerAlumne] = useState<Record<string, ElementLlista[]>>({})
  const { estudis: estudisOrNull } = useTotsEstudis()
  const estudis = estudisOrNull ?? ESTUDIS_BUIT
  const [nomGrupNou, setNomGrupNou] = useState('')
  const [cursGrupNou, setCursGrupNou] = useState('2026-2027')
  const [creantGrup, setCreantGrup] = useState(false)
  const [copiat, setCopiat] = useState(false)
  const [carregantGrup, setCarregantGrup] = useState(false)

  async function copiarCodi(codi: string) {
    try {
      await navigator.clipboard.writeText(codi)
      setCopiat(true)
      setTimeout(() => setCopiat(false), 1500)
    } catch {
      // ignorat: el navegador pot no permetre el porta-retalls
    }
  }

  async function carregarGrups() {
    if (!perfil) return
    const g = await repo.grupsDelTutor(perfil.id)
    setGrups(g)
    if (g.length > 0 && !g.some((grup) => grup.id === grupId)) setGrupId(g[0].id)
    return g
  }

  useEffect(() => {
    carregarGrups()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil])

  async function crearGrup() {
    if (!perfil || !nomGrupNou.trim()) return
    setCreantGrup(true)
    try {
      const nou = await repo.crearGrup(nomGrupNou.trim(), cursGrupNou, perfil.id)
      setNomGrupNou('')
      await carregarGrups()
      setGrupId(nou.id)
    } finally {
      setCreantGrup(false)
    }
  }

  useEffect(() => {
    if (!grupId) return
    // Es carrega tot en paral·lel (abans era seqüencial: 3+ peticions per alumne una darrere
    // l'altra) i, si es canvia de grup a mig carregar, la resposta antiga es descarta.
    let actiu = true
    setCarregantGrup(true)
    ;(async () => {
      try {
        const lista = await repo.alumnesDelGrup(grupId)
        const perAlumne = await Promise.all(
          lista.map(async (alumne) => {
            const [r, llistes] = await Promise.all([repo.ultimResultat(alumne.id, 'riasec'), repo.llistesDeLAlumne(alumne.id)])
            const elements = (await Promise.all(llistes.map((l) => repo.elementsDeLaLlista(l.id)))).flat()
            return { id: alumne.id, riasec: r ? (r.resultat as ResultatRiasec) : null, elements }
          }),
        )
        if (!actiu) return
        const riasec: Record<string, ResultatRiasec> = {}
        const elements: Record<string, ElementLlista[]> = {}
        for (const a of perAlumne) {
          if (a.riasec) riasec[a.id] = a.riasec
          elements[a.id] = a.elements
        }
        setAlumnes(lista)
        setResultatsRiasec(riasec)
        setElementsPerAlumne(elements)
      } finally {
        if (actiu) setCarregantGrup(false)
      }
    })()
    return () => {
      actiu = false
    }
  }, [grupId])

  const estudisPerId = useMemo(() => Object.fromEntries(estudis.map((e) => [e.id, e])), [estudis])

  const stats = useMemo(() => {
    const percentatgeTests = alumnes.length ? Math.round((Object.keys(resultatsRiasec).length / alumnes.length) * 100) : 0

    const comptesPerfil: Record<PerfilRiasec, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
    for (const r of Object.values(resultatsRiasec)) for (const p of r.dominants) comptesPerfil[p]++

    const comptesArea: Record<string, number> = {}
    const comptesTipus: Record<string, number> = { grau: 0, fp: 0, batxillerat: 0, artistic: 0 }
    for (const items of Object.values(elementsPerAlumne)) {
      for (const it of items) {
        const e = estudisPerId[it.estudiId]
        if (!e) continue
        comptesArea[e.area] = (comptesArea[e.area] ?? 0) + 1
        comptesTipus[e.tipus] = (comptesTipus[e.tipus] ?? 0) + 1
      }
    }

    const comptesEstat: Record<string, number> = {}
    for (const a of alumnes) comptesEstat[a.estatDecisio] = (comptesEstat[a.estatDecisio] ?? 0) + 1

    const senseLlista = alumnes.filter((a) => !((elementsPerAlumne[a.id]?.length ?? 0) > 0))

    const areesOrdenades = Object.entries(comptesArea).sort((a, b) => b[1] - a[1])
    const totalAreaComptes = areesOrdenades.reduce((s, [, n]) => s + n, 0)
    const top3 = areesOrdenades.slice(0, 3)
    const fraseResum =
      top3.length > 0 && totalAreaComptes > 0
        ? `${top3.map(([a]) => a).join(', ')} sumen el ${Math.round((top3.reduce((s, [, n]) => s + n, 0) / totalAreaComptes) * 100)}% de l'interès.`
        : 'Encara no hi ha prou dades de llistes per calcular les àrees d\'interès.'

    return { percentatgeTests, comptesPerfil, areesOrdenades, comptesTipus, comptesEstat, senseLlista, fraseResum }
  }, [alumnes, resultatsRiasec, elementsPerAlumne, estudisPerId])

  function exportarCSV() {
    // Un nom que comenci per =, +, - o @ s'executaria com a fórmula en obrir el CSV a Excel
    // (els noms els escriuen els alumnes): es neutralitza amb una cometa simple al davant.
    const cela = (v: string) => `"${(/^[=+\-@\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`
    const files = [['Nom', 'Correu', 'Curs', 'Nota mitjana', 'Estat de decisió', 'Perfils RIASEC dominants', 'Estudis a les llistes']]
    for (const a of alumnes) {
      const dominants = resultatsRiasec[a.id]?.dominants.map((p) => NOM_PERFIL[p]).join(' / ') ?? ''
      const numEstudis = elementsPerAlumne[a.id]?.length ?? 0
      files.push([a.nom, a.email, a.cursActual ?? '', a.notaMitjana?.toString() ?? '', ETIQUETES_ESTAT_DECISIO[a.estatDecisio], dominants, numEstudis.toString()])
    }
    const csv = files.map((fila) => fila.map((v) => cela(String(v))).join(';')).join('\r\n')
    // BOM perquè Excel llegeixi bé els accents (sense, "Núria" surt com "NÃºria").
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const nomGrup = (grups?.find((g) => g.id === grupId)?.nom ?? 'grup').toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')
    a.download = `${nomGrup || 'grup'}.csv`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  if (!grups) {
    return <div className="fade-in"><SkeletonOrientadorDashboard /></div>
  }

  // Un compte de tutor/a nou no pot crear grups ni veure alumnes fins que un admin l'aprova.
  if (perfil?.tutorAprovat === false) {
    return (
      <div className="fade-in space-y-4">
        <p className="eyebrow">El teu grup</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">El meu grup</h1>
        <Card className="border-t-4 border-t-accent">
          <h2 className="font-semibold text-ink">Compte pendent d'aprovació</h2>
          <p className="mt-1 text-sm text-muted">
            Per protegir les dades de l'alumnat, l'administració de l'escola ha de confirmar que ets docent abans que puguis crear
            grups. Quan t'hagin aprovat, torna a entrar i ja podràs crear el teu grup i obtenir el codi de classe.
          </p>
        </Card>
      </div>
    )
  }

  const formulariGrupNou = (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <Label htmlFor="nomGrupNou">Nom del grup</Label>
        <TextInput id="nomGrupNou" value={nomGrupNou} onChange={(e) => setNomGrupNou(e.target.value)} placeholder="Ex: 4t ESO A" />
      </div>
      <div>
        <Label htmlFor="cursGrupNou">Curs</Label>
        <TextInput id="cursGrupNou" value={cursGrupNou} onChange={(e) => setCursGrupNou(e.target.value)} />
      </div>
      <Button onClick={crearGrup} disabled={creantGrup || !nomGrupNou.trim()}>{creantGrup ? 'Creant…' : 'Crea el grup'}</Button>
    </div>
  )

  if (grups.length === 0) {
    return (
      <div className="fade-in space-y-4">
        <p className="eyebrow">El teu grup</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">El meu grup</h1>
        <Card className="border-t-4 border-t-primary">
          <p className="mb-3 text-sm text-muted">Encara no tens cap grup. Crea'n un per obtenir un codi de classe i convidar-hi els teus alumnes.</p>
          {formulariGrupNou}
        </Card>
      </div>
    )
  }

  const grupActiu = grups.find((g) => g.id === grupId)

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="eyebrow">El teu grup</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">El meu grup</h1>
          <p className="text-sm text-muted" aria-live="polite">
            {carregantGrup ? 'Carregant dades del grup…' : `${alumnes.length} alumnes · ${stats.percentatgeTests}% han fet el test RIASEC`}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={grupId} onChange={(e) => setGrupId(e.target.value)} className="w-auto" aria-label="Grup">
            {grups.map((g) => <option key={g.id} value={g.id}>{g.nom} ({g.curs})</option>)}
          </Select>
          <Button variant="secondary" onClick={exportarCSV} disabled={carregantGrup || alumnes.length === 0}>Exporta a CSV</Button>
        </div>
      </div>

      <Card className="border-t-4 border-t-accent">
        <h2 className="mb-2 font-semibold text-ink">Codi de classe del grup seleccionat</h2>
        <p className="text-sm text-muted">Dona aquest codi als teus alumnes perquè es registrin a «{grupActiu?.nom}».</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={() => copiarCodi(grupActiu?.codiInvitacio ?? '')}
            className="rounded-md border border-line bg-canvas px-4 py-2 font-serif text-xl font-semibold tracking-wide text-ink transition-colors hover:bg-info-bg"
            title="Copia el codi"
          >
            {grupActiu?.codiInvitacio}
          </button>
          <span className="text-xs text-muted">{copiat ? '✓ Copiat!' : 'Clica per copiar'}</span>
          <Badge tipus="warning">Correu @{grupActiu?.dominiCorreu}</Badge>
        </div>
        <p className="mt-3 text-sm text-muted">
          Important: digues als teus alumnes que, a més del codi, s'han de registrar amb un correu «@{grupActiu?.dominiCorreu}»
          (el mateix domini que el teu); amb qualsevol altre correu el registre es rebutjarà.
        </p>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-primary">+ Crea un altre grup</summary>
          <div className="mt-2">{formulariGrupNou}</div>
        </details>
      </Card>

      <div className="stagger grid gap-4 sm:grid-cols-2">
        <Card className="border-t-4 border-t-primary">
          <h2 className="mb-2 font-semibold text-ink">Distribució de perfils RIASEC</h2>
          {Object.keys(resultatsRiasec).length === 0 ? (
            <p className="flex h-56 items-center justify-center text-center text-sm text-muted">Encara cap alumne del grup ha fet el test RIASEC.</p>
          ) : (
          <div className="h-56 w-full" role="img" aria-label="Gràfic circular amb la distribució de perfils RIASEC; els valors exactes són a la taula de sota.">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={(Object.keys(stats.comptesPerfil) as PerfilRiasec[]).map((p) => ({ nom: NOM_PERFIL[p], valor: stats.comptesPerfil[p] }))} dataKey="valor" nameKey="nom" outerRadius={80}>
                  {(Object.keys(stats.comptesPerfil) as PerfilRiasec[]).map((p, i) => <Cell key={p} fill={COLORS_RIASEC[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <TaulaAccessible
              titol="Distribució de perfils RIASEC"
              columnes={['Perfil', 'Alumnes']}
              files={(Object.keys(stats.comptesPerfil) as PerfilRiasec[]).map((p) => [NOM_PERFIL[p], stats.comptesPerfil[p]])}
            />
          </div>
          )}
        </Card>

        <Card className="border-t-4 border-t-accent">
          <h2 className="mb-2 font-semibold text-ink">Estudis guardats a les llistes, per tipus</h2>
          <div className="h-56 w-full" role="img" aria-label="Gràfic de barres amb el nombre d'estudis guardats a les llistes del grup, per tipus; els valors exactes són a la taula de sota.">
            <ResponsiveContainer>
              <BarChart data={[{ nom: 'Graus', valor: stats.comptesTipus.grau }, { nom: 'FP', valor: stats.comptesTipus.fp }, { nom: 'Batxillerat', valor: stats.comptesTipus.batxillerat }, { nom: 'Artístics', valor: stats.comptesTipus.artistic }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                <XAxis dataKey="nom" stroke="var(--color-muted)" fontSize={12} />
                <YAxis stroke="var(--color-muted)" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="valor" fill="var(--color-primary)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
            <TaulaAccessible
              titol="Estudis guardats a les llistes, per tipus"
              columnes={['Tipus', 'Estudis']}
              files={[['Graus', stats.comptesTipus.grau], ['FP', stats.comptesTipus.fp], ['Batxillerat', stats.comptesTipus.batxillerat], ['Artístics', stats.comptesTipus.artistic]]}
            />
          </div>
        </Card>
      </div>

      <Card className="border-t-4 border-t-primary">
        <h2 className="mb-1 font-semibold text-ink">Àrees d'interès més escollides</h2>
        <p className="text-sm text-muted">{stats.fraseResum}</p>
        <ul className="mt-2 space-y-1 text-sm">
          {stats.areesOrdenades.slice(0, 6).map(([area, n]) => (
            <li key={area} className="flex justify-between"><span className="text-ink">{area}</span><span className="text-muted">{n}</span></li>
          ))}
        </ul>
      </Card>

      <div className="stagger grid gap-4 sm:grid-cols-2">
        <Card className="border-t-4 border-t-primary">
          <h2 className="mb-2 font-semibold text-ink">Estat de la decisió del grup</h2>
          <ul className="space-y-1 text-sm">
            {Object.entries(ETIQUETES_ESTAT_DECISIO).map(([valor, etiqueta]) => (
              <li key={valor} className="flex justify-between"><span className="text-ink">{etiqueta}</span><span className="text-muted">{stats.comptesEstat[valor] ?? 0}</span></li>
            ))}
          </ul>
        </Card>
        <Card className="border-t-4 border-t-accent">
          <h2 className="mb-2 font-semibold text-ink">Alumnes sense cap llista</h2>
          {stats.senseLlista.length === 0 ? (
            <p className="text-sm text-muted">Tots els alumnes tenen com a mínim una llista.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {stats.senseLlista.map((a) => (
                <li key={a.id}><Link to={`/orientador/alumne/${a.id}`} className="text-primary underline">{a.nom}</Link></li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <h2 className="mb-2 font-semibold text-ink">Alumnes del grup</h2>
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2">Nom</th>
              <th className="py-2">Estat</th>
              <th className="py-2">Perfil RIASEC</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {alumnes.map((a) => (
              <tr key={a.id} className="border-b border-line transition-colors hover:bg-canvas">
                <td className="py-2 text-ink">{a.nom}</td>
                <td className="py-2"><Badge>{ETIQUETES_ESTAT_DECISIO[a.estatDecisio]}</Badge></td>
                <td className="py-2 text-muted">{resultatsRiasec[a.id]?.dominants.map((p) => NOM_PERFIL[p]).join(' / ') ?? '—'}</td>
                <td className="py-2"><Link to={`/orientador/alumne/${a.id}`} className="text-primary underline">Veure fitxa</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
