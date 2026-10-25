import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTotsEstudis } from '../data/useTotsEstudis'
import { crearCercador } from '../lib/search'
import { tr } from '../lib/traduccio'
import { estaAPropDeTerrassa } from '../lib/geo'
import { formatNumero, formatPreu } from '../lib/format'
import { afegirAlComparador, treureDelComparador, useComparador } from '../lib/comparador'
import { useAuth } from '../context/useAuth'
import { Tabs } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { Label, Select, TextInput, Checkbox, RangeDualSlider, RangeSlider } from '../components/ui/Forms'
import { EstatBuit, EstatError } from '../components/ui/Misc'
import { SkeletonCercador } from '../components/ui/Skeleton'
import { IconPin, IconSearch } from '../components/ui/Icons'
import { Foto } from '../components/ui/Foto'
import type { NomImatge } from '../lib/imatges'
import { TargetaEstudi } from '../components/cercador/TargetaEstudi'
import { SelectorLlistaModal } from '../components/llistes/SelectorLlistaModal'
import type { EstudiQualsevol, EstudiTipus } from '../types/estudi'

type TipusTab = 'tots' | EstudiTipus
type Ordre = 'rellevancia' | 'nota' | 'preu' | 'places' | 'distancia'

const TIPUS_VALIDS: TipusTab[] = ['tots', 'grau', 'fp', 'batxillerat', 'artistic']
const PAGINA = 24

/** "Privat (adscrit a la UB)" també és "Privat": la comparació exacta excloïa l'ESCAC. */
function coincideixTitularitat(titularitat: string, filtres: string[]): boolean {
  return filtres.some((f) => titularitat === f || titularitat.startsWith(`${f} `))
}

const PESTANYES: { id: TipusTab; etiqueta: string }[] = [
  { id: 'tots', etiqueta: 'Tots els estudis' },
  { id: 'grau', etiqueta: 'Graus universitaris' },
  { id: 'fp', etiqueta: 'Formació Professional' },
  { id: 'batxillerat', etiqueta: 'Batxillerat' },
  { id: 'artistic', etiqueta: 'Ensenyaments artístics' },
]

const BANNER: Record<TipusTab, { imatge: NomImatge; posicio: string; text: string }> = {
  tots: { imatge: 'hero', posicio: '50% 30%', text: 'Graus, Formació Professional, Batxillerat i ensenyaments artístics de Catalunya.' },
  grau: { imatge: 'graus', posicio: '50% 35%', text: 'Notes de tall, preus i places de les universitats catalanes.' },
  fp: { imatge: 'fp', posicio: '50% 40%', text: 'Cicles de FP bàsica, mitjana i superior, amb mapa i dades de contacte.' },
  batxillerat: { imatge: 'batxillerat', posicio: '50% 30%', text: 'Centres propers a Terrassa, modalitats i nivell de demanda.' },
  artistic: { imatge: 'artistic', posicio: '50% 30%', text: 'Disseny, música, cinema, art dramàtic i dansa.' },
}

function unics(valors: (string | null)[]): string[] {
  return Array.from(new Set(valors.filter((v): v is string => Boolean(v && v.trim())))).sort((a, b) =>
    a.localeCompare(b, 'ca'),
  )
}

interface Filtres {
  universitats: string[]
  tipusCentre: string[]
  municipi: string
  notaMin: number
  notaMax: number
  preuMax: number | null
  nomesDobles: boolean
  arees: string[]
  nivells: string[]
  families: string[]
  comarca: string
  titularitats: string[]
  modalitatsFp: string[]
  modalitatsBatx: string[]
  distanciaMax: number | null
  disciplines: string[]
}

const FILTRES_INICIALS: Filtres = {
  universitats: [],
  tipusCentre: [],
  municipi: '',
  notaMin: 5,
  notaMax: 14,
  preuMax: null,
  nomesDobles: false,
  arees: [],
  nivells: [],
  families: [],
  comarca: '',
  titularitats: [],
  modalitatsFp: [],
  modalitatsBatx: [],
  distanciaMax: null,
  disciplines: [],
}

export default function Cercador() {
  const { perfil } = useAuth()
  const [params, setParams] = useSearchParams()
  const { estudis, error, retry } = useTotsEstudis()
  const [tipusTab, setTipusTab] = useState<TipusTab>(() => {
    const t = params.get('tipus') as TipusTab | null
    return t && TIPUS_VALIDS.includes(t) ? t : 'tots'
  })
  const [text, setText] = useState(params.get('q') ?? '')
  const [apropTerrassa, setApropTerrassa] = useState(false)
  const [ordre, setOrdre] = useState<Ordre>('rellevancia')
  const [filtres, setFiltres] = useState<Filtres>(FILTRES_INICIALS)
  const [estudiPerAfegir, setEstudiPerAfegir] = useState<EstudiQualsevol | null>(null)
  const [missatge, setMissatge] = useState<string | null>(null)
  const temporitzadorMissatge = useRef<number | undefined>(undefined)

  useEffect(() => {
    setParams((p) => {
      const nous = new URLSearchParams(p)
      if (text) nous.set('q', text)
      else nous.delete('q')
      if (tipusTab !== 'tots') nous.set('tipus', tipusTab)
      else nous.delete('tipus')
      return nous
    }, { replace: true })
  }, [text, tipusTab, setParams])

  useEffect(() => () => window.clearTimeout(temporitzadorMissatge.current), [])

  function canviarTab(id: TipusTab) {
    setTipusTab(id)
    // Cada pestanya té els seus filtres: si no, una família de FP o una titularitat
    // triades en una pestanya buidaven en silenci els resultats de l'altra.
    setFiltres(FILTRES_INICIALS)
  }

  const cercador = useMemo(() => (estudis ? crearCercador(estudis) : null), [estudis])

  const universitats = useMemo(
    () => unics((estudis ?? []).filter((e): e is EstudiQualsevol & { tipus: 'grau' } => e.tipus === 'grau').map((e) => e.raw.universidad)),
    [estudis],
  )
  const arees = useMemo(() => unics((estudis ?? []).filter((e) => e.tipus === 'grau').map((e) => e.area)), [estudis])
  const families = useMemo(() => unics((estudis ?? []).filter((e) => e.tipus === 'fp').map((e) => e.area)), [estudis])
  const comarques = useMemo(() => unics((estudis ?? []).filter((e) => e.tipus === 'fp').map((e) => e.comarca)), [estudis])
  const disciplines = useMemo(
    () => unics((estudis ?? []).filter((e) => e.tipus === 'artistic').flatMap((e) => e.area.split(' · '))),
    [estudis],
  )

  function alternarValor(llista: string[], valor: string): string[] {
    return llista.includes(valor) ? llista.filter((v) => v !== valor) : [...llista, valor]
  }

  const resultats = useMemo(() => {
    if (!estudis) return []
    let base = estudis
    if (tipusTab !== 'tots') base = base.filter((e) => e.tipus === tipusTab)

    if (text.trim() && cercador) {
      const idsBase = new Set(base.map((e) => e.id))
      base = cercador.search(text).map((r) => r.item).filter((e) => idsBase.has(e.id))
    }

    if (apropTerrassa) base = base.filter((e) => estaAPropDeTerrassa(e))

    base = base.filter((e) => {
      if (e.tipus === 'grau') {
        const raw = e.raw
        if (filtres.universitats.length && !filtres.universitats.includes(raw.universidad)) return false
        if (filtres.tipusCentre.length && !filtres.tipusCentre.includes(e.titularitat)) return false
        if (filtres.arees.length && !filtres.arees.includes(e.area)) return false
        if (filtres.municipi && !e.municipi.toLowerCase().includes(filtres.municipi.toLowerCase())) return false
        if (raw.nota_corte_2026 != null && (raw.nota_corte_2026 < filtres.notaMin || raw.nota_corte_2026 > filtres.notaMax)) return false
        if (filtres.preuMax != null && e.preu != null && e.preu > filtres.preuMax) return false
        if (filtres.nomesDobles && !raw.doble) return false
      }
      if (e.tipus === 'fp') {
        if (filtres.nivells.length && !filtres.nivells.includes(tr(e.raw.nivel))) return false
        if (filtres.families.length && !filtres.families.includes(e.area)) return false
        if (filtres.comarca && e.comarca !== filtres.comarca) return false
        if (filtres.municipi && !e.municipi.toLowerCase().includes(filtres.municipi.toLowerCase())) return false
        if (filtres.titularitats.length && !coincideixTitularitat(e.titularitat, filtres.titularitats)) return false
        if (filtres.modalitatsFp.length && !filtres.modalitatsFp.includes(e.raw.modalidad)) return false
      }
      if (e.tipus === 'batxillerat') {
        if (filtres.modalitatsBatx.length && !filtres.modalitatsBatx.some((m) => e.area.includes(m))) return false
        if (filtres.titularitats.length && !coincideixTitularitat(e.titularitat, filtres.titularitats)) return false
        if (filtres.distanciaMax != null && (e.kmTerrassa == null || e.kmTerrassa > filtres.distanciaMax)) return false
      }
      if (e.tipus === 'artistic') {
        if (filtres.disciplines.length && !filtres.disciplines.some((d) => e.area.includes(d))) return false
        if (filtres.titularitats.length && !coincideixTitularitat(e.titularitat, filtres.titularitats)) return false
        if (filtres.municipi && !e.municipi.toLowerCase().includes(filtres.municipi.toLowerCase())) return false
      }
      return true
    })

    const ordenats = [...base]
    switch (ordre) {
      case 'nota':
        ordenats.sort((a, b) => (a.notaTall2026 ?? 99) - (b.notaTall2026 ?? 99))
        break
      case 'preu':
        ordenats.sort((a, b) => (a.preu ?? Infinity) - (b.preu ?? Infinity))
        break
      case 'places':
        ordenats.sort((a, b) => (b.places ?? 0) - (a.places ?? 0))
        break
      case 'distancia':
        ordenats.sort((a, b) => (a.kmTerrassa ?? Infinity) - (b.kmTerrassa ?? Infinity))
        break
      default:
        if (!text.trim()) ordenats.sort((a, b) => Number(b.destacat) - Number(a.destacat))
    }
    return ordenats
  }, [estudis, tipusTab, text, cercador, apropTerrassa, filtres, ordre])

  const comparadorActual = useComparador()
  const idsComparador = useMemo(() => new Set(comparadorActual.map((i) => i.id)), [comparadorActual])

  function alternarComparador(e: EstudiQualsevol) {
    if (idsComparador.has(e.id)) {
      treureDelComparador(e.id)
      setMissatge(`"${e.nom}" tret del comparador.`)
    } else {
      const res = afegirAlComparador(e.id, e.tipus)
      setMissatge(res.ok ? `"${e.nom}" afegit al comparador.` : res.motiu ?? null)
    }
    window.clearTimeout(temporitzadorMissatge.current)
    temporitzadorMissatge.current = window.setTimeout(() => setMissatge(null), 3000)
  }

  // Es pinten els resultats de 24 en 24: pintar-ne 4.000+ de cop feia lent cada canvi de filtre.
  const clauResultats = JSON.stringify([tipusTab, text, apropTerrassa, filtres, ordre])
  const [paginacio, setPaginacio] = useState({ clau: clauResultats, visibles: PAGINA })
  const visibles = paginacio.clau === clauResultats ? paginacio.visibles : PAGINA
  const sentinella = useRef<HTMLDivElement>(null)

  function mostrarMes() {
    setPaginacio({ clau: clauResultats, visibles: visibles + PAGINA })
  }

  useEffect(() => {
    const el = sentinella.current
    if (!el || visibles >= resultats.length || typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver((entrades) => {
      if (entrades[0]?.isIntersecting) mostrarMes()
    }, { rootMargin: '600px' })
    observador.observe(el)
    return () => observador.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibles, resultats.length, clauResultats])

  const xips: { text: string; onRemove: () => void }[] = []
  if (apropTerrassa) xips.push({ text: 'A prop de Terrassa', onRemove: () => setApropTerrassa(false) })
  if (filtres.municipi) xips.push({ text: filtres.municipi, onRemove: () => setFiltres((f) => ({ ...f, municipi: '' })) })
  filtres.universitats.forEach((u) => xips.push({ text: u, onRemove: () => setFiltres((f) => ({ ...f, universitats: f.universitats.filter((x) => x !== u) })) }))
  filtres.tipusCentre.forEach((t) => xips.push({ text: t, onRemove: () => setFiltres((f) => ({ ...f, tipusCentre: f.tipusCentre.filter((x) => x !== t) })) }))
  if (filtres.notaMin > 5 || filtres.notaMax < 14) xips.push({ text: `Nota de tall ${formatNumero(filtres.notaMin)}–${formatNumero(filtres.notaMax)}`, onRemove: () => setFiltres((f) => ({ ...f, notaMin: 5, notaMax: 14 })) })
  if (filtres.preuMax != null) xips.push({ text: `Preu < ${formatPreu(filtres.preuMax)}`, onRemove: () => setFiltres((f) => ({ ...f, preuMax: null })) })
  if (filtres.nomesDobles) xips.push({ text: 'Només dobles graus', onRemove: () => setFiltres((f) => ({ ...f, nomesDobles: false })) })
  filtres.arees.forEach((a) => xips.push({ text: a, onRemove: () => setFiltres((f) => ({ ...f, arees: f.arees.filter((x) => x !== a) })) }))
  filtres.nivells.forEach((n) => xips.push({ text: n, onRemove: () => setFiltres((f) => ({ ...f, nivells: f.nivells.filter((x) => x !== n) })) }))
  filtres.families.forEach((fa) => xips.push({ text: fa, onRemove: () => setFiltres((f) => ({ ...f, families: f.families.filter((x) => x !== fa) })) }))
  if (filtres.comarca) xips.push({ text: filtres.comarca, onRemove: () => setFiltres((f) => ({ ...f, comarca: '' })) })
  filtres.titularitats.forEach((t) => xips.push({ text: t, onRemove: () => setFiltres((f) => ({ ...f, titularitats: f.titularitats.filter((x) => x !== t) })) }))
  filtres.modalitatsFp.forEach((m) => xips.push({ text: m, onRemove: () => setFiltres((f) => ({ ...f, modalitatsFp: f.modalitatsFp.filter((x) => x !== m) })) }))
  filtres.modalitatsBatx.forEach((m) => xips.push({ text: m, onRemove: () => setFiltres((f) => ({ ...f, modalitatsBatx: f.modalitatsBatx.filter((x) => x !== m) })) }))
  if (filtres.distanciaMax != null) xips.push({ text: `Fins a ${filtres.distanciaMax} km`, onRemove: () => setFiltres((f) => ({ ...f, distanciaMax: null })) })
  filtres.disciplines.forEach((d) => xips.push({ text: d, onRemove: () => setFiltres((f) => ({ ...f, disciplines: f.disciplines.filter((x) => x !== d) })) }))

  if (error) {
    return (
      <div className="fade-in space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Cercador acadèmic</h1>
        </div>
        <EstatError missatge={error} onReintentar={retry} />
      </div>
    )
  }

  if (!estudis) {
    return <div className="fade-in"><SkeletonCercador /></div>
  }

  return (
    <div className="fade-in space-y-5">
      <div>
        <section className="relative isolate overflow-hidden rounded-2xl bg-[#2a1a0e]">
          <div key={tipusTab} className="fade-in absolute inset-0 -z-20">
            <Foto nom={BANNER[tipusTab].imatge} prioritaria posicio={BANNER[tipusTab].posicio} />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#2a1a0e]/90 via-[#2a1a0e]/65 to-[#2a1a0e]/25" aria-hidden="true" />
          <div className="px-6 pb-12 pt-8 sm:px-10 sm:pb-14 sm:pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0c9a8]">Cercador</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#faf5ea] sm:text-3xl">
              {PESTANYES.find((p) => p.id === tipusTab)?.etiqueta ?? 'Cercador acadèmic'}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#efe6d6]">{BANNER[tipusTab].text}</p>
          </div>
        </section>

        <div className="relative z-10 -mt-7 mx-3 flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 shadow-md sm:mx-6 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <TextInput
              placeholder="Cerca per nom, universitat, centre o municipi…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="!pl-10"
              aria-label="Cerca un estudi"
            />
          </div>
          <Button variant={apropTerrassa ? 'primary' : 'secondary'} mida="md" onClick={() => setApropTerrassa((v) => !v)}>
            <IconPin /> A prop de Terrassa
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="ordre" className="mb-0 whitespace-nowrap">Ordena per</Label>
            <Select id="ordre" value={ordre} onChange={(e) => setOrdre(e.target.value as Ordre)} className="w-auto">
              <option value="rellevancia">Rellevància</option>
              <option value="nota">Nota de tall</option>
              <option value="preu">Preu</option>
              <option value="places">Places</option>
              <option value="distancia">Distància a Terrassa</option>
            </Select>
          </div>
        </div>
      </div>

      <Tabs pestanyes={PESTANYES} activa={tipusTab} onCanvia={(id) => canviarTab(id as TipusTab)} />

      {xips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {xips.map((x, i) => (
            <Chip key={i} onRemove={x.onRemove}>{x.text}</Chip>
          ))}
          <button className="text-xs text-muted underline" onClick={() => { setFiltres(FILTRES_INICIALS); setApropTerrassa(false) }}>
            Treure tots els filtres
          </button>
        </div>
      )}

      {missatge && <p role="status" className="fade-in rounded-lg bg-info-bg px-3 py-2 text-sm text-primary">{missatge}</p>}

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <Card as="aside" aria-label="Filtres" className="h-fit lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          {tipusTab === 'grau' && (
            <div className="space-y-4">
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-ink">Universitat</legend>
                <div className="space-y-1">
                  {universitats.map((u) => (
                    <Checkbox key={u} label={u} checked={filtres.universitats.includes(u)} onChange={() => setFiltres((f) => ({ ...f, universitats: alternarValor(f.universitats, u) }))} />
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-ink">Àrea</legend>
                <div className="space-y-1">
                  {arees.map((a) => (
                    <Checkbox key={a} label={a} checked={filtres.arees.includes(a)} onChange={() => setFiltres((f) => ({ ...f, arees: alternarValor(f.arees, a) }))} />
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-ink">Tipus de centre</legend>
                {['Pública (centre propi)', 'Pública (centre adscrit)', 'Privada'].map((t) => (
                  <Checkbox key={t} label={t} checked={filtres.tipusCentre.includes(t)} onChange={() => setFiltres((f) => ({ ...f, tipusCentre: alternarValor(f.tipusCentre, t) }))} />
                ))}
              </fieldset>
              <div>
                <Label htmlFor="filtre-municipi">Municipi</Label>
                <TextInput id="filtre-municipi" value={filtres.municipi} onChange={(e) => setFiltres((f) => ({ ...f, municipi: e.target.value }))} placeholder="Ex: Terrassa" />
              </div>
              <div>
                <Label>Nota de tall (2026)</Label>
                <RangeDualSlider min={5} max={14} step={0.1} valorMin={filtres.notaMin} valorMax={filtres.notaMax} onChange={(min, max) => setFiltres((f) => ({ ...f, notaMin: min, notaMax: max }))} etiqueta={(v) => formatNumero(v)} nomCamp="Nota de tall" />
              </div>
              <div>
                <Label>Preu màxim del 1r curs</Label>
                <RangeSlider min={0} max={20000} step={500} value={filtres.preuMax ?? 20000} onChange={(v) => setFiltres((f) => ({ ...f, preuMax: v >= 20000 ? null : v }))} etiqueta={(v) => (v >= 20000 ? 'Sense límit' : formatPreu(v))} ariaLabel="Preu màxim del primer curs" />
              </div>
              <Checkbox label="Només dobles graus" checked={filtres.nomesDobles} onChange={(e) => setFiltres((f) => ({ ...f, nomesDobles: e.target.checked }))} />
            </div>
          )}

          {tipusTab === 'fp' && (
            <div className="space-y-4">
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-ink">Nivell</legend>
                {['Grau bàsic', 'Grau mitjà', 'Grau superior', "Curs d'especialització (GM)", "Curs d'especialització (GS)"].map((n) => (
                  <Checkbox key={n} label={n} checked={filtres.nivells.includes(n)} onChange={() => setFiltres((f) => ({ ...f, nivells: alternarValor(f.nivells, n) }))} />
                ))}
              </fieldset>
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-ink">Família professional</legend>
                <div className="space-y-1">
                  {families.map((fa) => (
                    <Checkbox key={fa} label={fa} checked={filtres.families.includes(fa)} onChange={() => setFiltres((f) => ({ ...f, families: alternarValor(f.families, fa) }))} />
                  ))}
                </div>
              </fieldset>
              <div>
                <Label htmlFor="filtre-comarca">Comarca</Label>
                <Select id="filtre-comarca" value={filtres.comarca} onChange={(e) => setFiltres((f) => ({ ...f, comarca: e.target.value }))}>
                  <option value="">Totes</option>
                  {comarques.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="filtre-municipi">Municipi</Label>
                <TextInput id="filtre-municipi" value={filtres.municipi} onChange={(e) => setFiltres((f) => ({ ...f, municipi: e.target.value }))} placeholder="Ex: Terrassa" />
              </div>
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-ink">Titularitat</legend>
                {['Públic', 'Privat'].map((t) => (
                  <Checkbox key={t} label={t} checked={filtres.titularitats.includes(t)} onChange={() => setFiltres((f) => ({ ...f, titularitats: alternarValor(f.titularitats, t) }))} />
                ))}
              </fieldset>
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-ink">Modalitat</legend>
                {['Presencial', 'Virtual'].map((m) => (
                  <Checkbox key={m} label={m} checked={filtres.modalitatsFp.includes(m)} onChange={() => setFiltres((f) => ({ ...f, modalitatsFp: alternarValor(f.modalitatsFp, m) }))} />
                ))}
              </fieldset>
            </div>
          )}

          {tipusTab === 'batxillerat' && (
            <div className="space-y-4">
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-ink">Modalitat</legend>
                {['Ciències i Tecnologia', 'Humanitats i Ciències Socials', 'Arts', 'General'].map((m) => (
                  <Checkbox key={m} label={m} checked={filtres.modalitatsBatx.includes(m)} onChange={() => setFiltres((f) => ({ ...f, modalitatsBatx: alternarValor(f.modalitatsBatx, m) }))} />
                ))}
              </fieldset>
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-ink">Titularitat</legend>
                {['Públic', 'Concertat', 'Privat'].map((t) => (
                  <Checkbox key={t} label={t} checked={filtres.titularitats.includes(t)} onChange={() => setFiltres((f) => ({ ...f, titularitats: alternarValor(f.titularitats, t) }))} />
                ))}
              </fieldset>
              <div>
                <Label>Distància des de Terrassa</Label>
                <div className="flex gap-2">
                  {[5, 10, 20, 40].map((km) => (
                    <Button key={km} mida="sm" variant={filtres.distanciaMax === km ? 'primary' : 'secondary'} onClick={() => setFiltres((f) => ({ ...f, distanciaMax: f.distanciaMax === km ? null : km }))}>
                      {km} km
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tipusTab === 'artistic' && (
            <div className="space-y-4">
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-ink">Disciplina</legend>
                {disciplines.map((d) => (
                  <Checkbox key={d} label={d} checked={filtres.disciplines.includes(d)} onChange={() => setFiltres((f) => ({ ...f, disciplines: alternarValor(f.disciplines, d) }))} />
                ))}
              </fieldset>
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-ink">Titularitat</legend>
                {['Públic', 'Privat'].map((t) => (
                  <Checkbox key={t} label={t} checked={filtres.titularitats.includes(t)} onChange={() => setFiltres((f) => ({ ...f, titularitats: alternarValor(f.titularitats, t) }))} />
                ))}
              </fieldset>
              <div>
                <Label htmlFor="filtre-municipi">Municipi</Label>
                <TextInput id="filtre-municipi" value={filtres.municipi} onChange={(e) => setFiltres((f) => ({ ...f, municipi: e.target.value }))} placeholder="Ex: Terrassa" />
              </div>
            </div>
          )}

          {tipusTab === 'tots' && <p className="text-sm text-muted">Tria una pestanya per veure filtres específics d'aquell tipus d'estudi.</p>}
        </Card>

        <div>
          <p className="mb-3 text-sm text-muted" aria-live="polite">{formatNumero(resultats.length)} resultats</p>
          {resultats.length === 0 ? (
            <EstatBuit titol="No s'ha trobat cap estudi amb aquests filtres" descripcio="Prova a eixamplar els filtres o a canviar la cerca." />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {resultats.slice(0, visibles).map((e) => (
                  <TargetaEstudi
                    key={e.id}
                    estudi={e}
                    onAfegirAComparador={() => alternarComparador(e)}
                    esAlComparador={idsComparador.has(e.id)}
                    onAfegirALlista={perfil?.rol === 'alumne' ? () => setEstudiPerAfegir(e) : undefined}
                  />
                ))}
              </div>
              {visibles < resultats.length && (
                <div ref={sentinella} className="mt-6 flex justify-center">
                  <Button variant="secondary" onClick={mostrarMes}>
                    Mostra'n més ({formatNumero(resultats.length - visibles)} restants)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <SelectorLlistaModal estudi={estudiPerAfegir} onTancar={() => setEstudiPerAfegir(null)} />
    </div>
  )
}
