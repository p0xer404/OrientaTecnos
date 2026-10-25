import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { repo } from '../lib/repo'
import { useAuth } from '../context/useAuth'
import { AFIRMACIONS_RIASEC } from '../lib/riasec/preguntes'
import { calcularResultatRiasec } from '../lib/riasec/scoring'
import { NOM_PERFIL, DESCRIPCIO_PERFIL } from '../lib/riasec/mapping'
import { PREGUNTES_HABILITATS, NOM_CATEGORIA_HABILITAT } from '../lib/tests/habilitats'
import { calcularResultatHabilitats } from '../lib/tests/habilitats-scoring'
import { PREGUNTES_PREFERENCIES } from '../lib/tests/preferencies'
import { calcularResultatPreferencies } from '../lib/tests/preferencies-scoring'
import { Likert } from '../components/tests/Likert'
import { GraficRadar } from '../components/tests/GraficRadar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { RangeSlider } from '../components/ui/Forms'
import { IconChevronDown } from '../components/ui/Icons'
import type { PerfilRiasec, ResultatPreferencies, TestId } from '../types/domain'
import NotFound from './NotFound'

interface ItemLikert {
  tipus: 'likert'
  id: string
  text: string
}

interface ItemRang {
  tipus: 'rang'
  id: string
  text: string
  min: number
  max: number
  step: number
  valorPerDefecte: number
  unitat: string
}

type Item = ItemLikert | ItemRang

export default function TestDetall() {
  const { testId } = useParams<{ testId: string }>()
  const { perfil } = useAuth()
  const navigate = useNavigate()
  const [respostes, setRespostes] = useState<Record<string, number>>({})
  const [index, setIndex] = useState(0)
  const [resultat, setResultat] = useState<unknown | null>(null)
  const [desant, setDesant] = useState(false)
  const [errorDesar, setErrorDesar] = useState<string | null>(null)
  const desantRef = useRef(false)

  const items: Item[] = useMemo(() => {
    if (testId === 'riasec') return AFIRMACIONS_RIASEC.map((p) => ({ tipus: 'likert' as const, id: p.id, text: p.text }))
    if (testId === 'habilitats') return PREGUNTES_HABILITATS.map((p) => ({ tipus: 'likert' as const, id: p.id, text: p.text }))
    if (testId === 'preferencies')
      return PREGUNTES_PREFERENCIES.map((p) =>
        p.tipus === 'likert'
          ? { tipus: 'likert' as const, id: p.id, text: p.text }
          : { tipus: 'rang' as const, id: p.id, text: p.text, min: p.min, max: p.max, step: p.step, valorPerDefecte: p.valorPerDefecte, unitat: p.unitat },
      )
    return []
  }, [testId])

  const totalPreguntes = items.length
  const itemActual = items[index]
  const respostaActual = itemActual ? respostes[itemActual.id] : undefined
  const respost = itemActual?.tipus === 'rang' ? true : respostaActual !== undefined
  const esDarrera = index === totalPreguntes - 1
  const percentatge = totalPreguntes > 0 ? Math.round(((index + (respost ? 1 : 0)) / totalPreguntes) * 100) : 0

  const dadesRadar = useMemo(() => {
    if (!resultat) return []
    if (testId === 'riasec') {
      const r = resultat as ReturnType<typeof calcularResultatRiasec>
      return (Object.keys(r.puntuacions) as PerfilRiasec[]).map((p) => ({ etiqueta: NOM_PERFIL[p], valor: r.puntuacions[p] }))
    }
    if (testId === 'habilitats') {
      const r = resultat as ReturnType<typeof calcularResultatHabilitats>
      return Object.entries(r.puntuacions).map(([cat, valor]) => ({ etiqueta: NOM_CATEGORIA_HABILITAT[cat as keyof typeof NOM_CATEGORIA_HABILITAT], valor }))
    }
    return []
  }, [resultat, testId])

  if (!testId || items.length === 0) return <NotFound />
  if (!perfil) return <NotFound />

  function respondre(valor: number) {
    if (!itemActual) return
    setRespostes((r) => ({ ...r, [itemActual.id]: valor }))
  }

  async function desarIAcabar(respostesFinals: Record<string, number>) {
    if (!perfil || !testId || desantRef.current) return
    desantRef.current = true
    setDesant(true)
    setErrorDesar(null)
    try {
      let calculat: unknown
      if (testId === 'riasec') calculat = calcularResultatRiasec(respostesFinals)
      else if (testId === 'habilitats') calculat = calcularResultatHabilitats(respostesFinals)
      else {
        // Aquest test no pregunta les matèries del qüestionari inicial: es conserven de
        // l'últim resultat perquè no desapareguin del perfil ni de la fitxa del tutor/a.
        const anterior = (await repo.ultimResultat(perfil.id, 'preferencies'))?.resultat as ResultatPreferencies | undefined
        calculat = {
          ...calcularResultatPreferencies(respostesFinals),
          materiesBones: anterior?.materiesBones,
          materiesFluixes: anterior?.materiesFluixes,
          materiesPreferides: anterior?.materiesPreferides,
          materiesMenysPreferides: anterior?.materiesMenysPreferides,
        } satisfies ResultatPreferencies
      }

      await repo.desarResultatTest(perfil.id, testId as TestId, respostesFinals, calculat)
      setResultat(calculat)
    } catch {
      setErrorDesar("No s'ha pogut desar el resultat. Comprova la connexió i torna-ho a provar.")
    } finally {
      desantRef.current = false
      setDesant(false)
    }
  }

  function seguent() {
    if (!itemActual) return
    const respostesActuals = itemActual.tipus === 'rang' && respostaActual === undefined
      ? { ...respostes, [itemActual.id]: itemActual.valorPerDefecte }
      : respostes
    if (respostesActuals !== respostes) setRespostes(respostesActuals)

    if (esDarrera) {
      desarIAcabar(respostesActuals)
    } else {
      setIndex((i) => i + 1)
    }
  }

  function enrere() {
    setIndex((i) => Math.max(0, i - 1))
  }

  if (resultat) {
    return (
      <div className="fade-in mx-auto max-w-2xl space-y-4">
        <p className="eyebrow">Resultat</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Resultats del test</h1>
        {testId === 'preferencies' ? (
          <Card className="space-y-3 border-t-4 border-t-primary text-sm text-ink">
            {(() => {
              const r = resultat as ResultatPreferencies
              return (
                <ul className="space-y-2">
                  <li>Tendència universitat/FP: <strong>{r.universitatVsFp >= 60 ? 'cap a la universitat' : r.universitatVsFp <= 40 ? 'cap a la FP' : 'equilibrada'}</strong> ({r.universitatVsFp}/100)</li>
                  <li>Tendència públic/privat: <strong>{r.publicVsPrivat >= 60 ? 'obert/a al privat' : r.publicVsPrivat <= 40 ? 'prefereix el públic' : 'equilibrada'}</strong> ({r.publicVsPrivat}/100)</li>
                  <li>Importància de la nota de tall: <strong>{r.importanciaNota}/100</strong></li>
                  <li>Importància de l'idioma: <strong>{r.importanciaIdioma}/100</strong></li>
                  <li>Pressupost màxim indicat: <strong>{r.pressupostMax.toLocaleString('ca-ES')} €/any</strong></li>
                  <li>Disposició a desplaçar-te: <strong>{r.disposatDesplacar} km</strong></li>
                </ul>
              )
            })()}
          </Card>
        ) : (
          <Card className="border-t-4 border-t-primary">
            <GraficRadar dades={dadesRadar} />
            {testId === 'riasec' && (
              <div className="mt-4 space-y-2 text-sm">
                {(resultat as ReturnType<typeof calcularResultatRiasec>).dominants.map((p) => (
                  <p key={p}><strong className="text-ink">{NOM_PERFIL[p]}:</strong> <span className="text-muted">{DESCRIPCIO_PERFIL[p]}</span></p>
                ))}
              </div>
            )}
          </Card>
        )}
        <div className="flex gap-2">
          <Link to="/tests"><Button variant="secondary">Tornar als tests</Button></Link>
          <Link to="/recomanacions"><Button>Veure les meves recomanacions</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="sticky top-16 z-20 -mx-4 bg-canvas/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-md sm:border sm:border-line">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Pregunta {index + 1} de {totalPreguntes}</span>
          <span>{percentatge}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out" style={{ width: `${percentatge}%` }} />
        </div>
      </div>

      <div key={itemActual.id} className="page-fade space-y-4">
        <p className="eyebrow">
          {testId === 'riasec' && "Test d'interessos (RIASEC)"}
          {testId === 'habilitats' && "Test d'habilitats percebudes"}
          {testId === 'preferencies' && 'Test de preferències pràctiques'}
        </p>

        <Card className="border-t-4 border-t-primary">
          {itemActual.tipus === 'likert' ? (
            <Likert id={itemActual.id} text={itemActual.text} valor={respostaActual} onCanvia={respondre} />
          ) : (
            <div>
              <p className="mb-3 text-base font-medium text-ink">{itemActual.text}</p>
              <RangeSlider
                min={itemActual.min}
                max={itemActual.max}
                step={itemActual.step}
                value={respostaActual ?? itemActual.valorPerDefecte}
                onChange={respondre}
                etiqueta={(v) => `${v.toLocaleString('ca-ES')} ${itemActual.unitat}`}
                ariaLabel={itemActual.text}
              />
            </div>
          )}
        </Card>

        {errorDesar && <p role="alert" className="fade-in text-sm text-warning">{errorDesar}</p>}

        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={index === 0 ? () => navigate('/tests') : enrere} disabled={desant}>
            <IconChevronDown className="rotate-90" />
            {index === 0 ? 'Cancel·la' : 'Enrere'}
          </Button>
          <Button onClick={seguent} disabled={!respost || desant}>
            {desant ? 'Desant…' : esDarrera ? 'Veure els resultats' : 'Següent'}
            {!esDarrera && <IconChevronDown className="-rotate-90" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
