import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { repo } from '../lib/repo'
import { useAuth } from '../context/useAuth'
import { ESTUDIS_BUIT, useTotsEstudis } from '../data/useTotsEstudis'
import { crearCercador } from '../lib/search'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { TextInput } from '../components/ui/Forms'
import { Badge } from '../components/ui/Badge'
import { EstatBuit } from '../components/ui/Misc'
import { SkeletonLlistes } from '../components/ui/Skeleton'
import { formatPreu } from '../lib/format'
import type { ElementLlista, Llista } from '../types/domain'
import type { EstudiQualsevol } from '../types/estudi'

export default function Llistes() {
  const { perfil } = useAuth()
  const [llistes, setLlistes] = useState<Llista[] | null>(null)
  const [actiuId, setActiuId] = useState<string | null>(null)
  const [elements, setElements] = useState<ElementLlista[]>([])
  const { estudis: totsEstudisOrNull, error: errorEstudis } = useTotsEstudis()
  const totsEstudis = totsEstudisOrNull ?? ESTUDIS_BUIT
  const estudis = useMemo(() => Object.fromEntries(totsEstudis.map((e) => [e.id, e])), [totsEstudis])
  const [nomNova, setNomNova] = useState('')
  const [arrossegat, setArrossegat] = useState<string | null>(null)
  const [cercaText, setCercaText] = useState('')
  const [afegintId, setAfegintId] = useState<string | null>(null)
  const [errorAccio, setErrorAccio] = useState<string | null>(null)

  const cercador = useMemo(() => (totsEstudis.length ? crearCercador(totsEstudis) : null), [totsEstudis])
  const idsALaLlista = useMemo(() => new Set(elements.map((e) => e.estudiId)), [elements])
  const resultatsCerca = useMemo(() => {
    if (!cercador || !cercaText.trim()) return []
    return cercador
      .search(cercaText)
      .map((r) => r.item)
      .filter((e) => !idsALaLlista.has(e.id))
      .slice(0, 6)
  }, [cercador, cercaText, idsALaLlista])

  /** Torna a llegir les llistes i deixa activa `preferida` (si existeix), l'actual si encara
   * existeix, o la primera. Abans es llegia `actiuId` del tancament (valor antic): en
   * esborrar la llista activa no se'n seleccionava cap altra i es veia "Crea la teva primera llista". */
  async function carregarLlistes(preferida?: string | null) {
    if (!perfil) return
    const dades = await repo.llistesDeLAlumne(perfil.id)
    setLlistes(dades)
    setActiuId((actual) => {
      const candidat = preferida !== undefined ? preferida : actual
      if (candidat && dades.some((l) => l.id === candidat)) return candidat
      return dades[0]?.id ?? null
    })
  }

  async function ambGestioErrors(accio: () => Promise<void>) {
    setErrorAccio(null)
    try {
      await accio()
    } catch {
      setErrorAccio("No s'ha pogut completar l'acció. Comprova la connexió i torna-ho a provar.")
    }
  }

  useEffect(() => {
    carregarLlistes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil])

  useEffect(() => {
    if (!actiuId) {
      setElements([])
      return
    }
    // Si es canvia de llista ràpid, una resposta antiga no ha de sobreescriure la nova.
    let actiu = true
    repo.elementsDeLaLlista(actiuId).then((els) => {
      if (actiu) setElements(els)
    })
    return () => {
      actiu = false
    }
  }, [actiuId])

  if (!perfil || !llistes) {
    return <div className="fade-in"><SkeletonLlistes /></div>
  }

  async function crear(e?: FormEvent) {
    e?.preventDefault()
    const nom = nomNova.trim()
    if (!nom) return
    await ambGestioErrors(async () => {
      const llista = await repo.crearLlista(perfil!.id, nom)
      setNomNova('')
      await carregarLlistes(llista.id)
    })
  }

  async function eliminar(llista: Llista) {
    if (!confirm(`Vols eliminar la llista «${llista.nom}» i tots els estudis que conté?`)) return
    await ambGestioErrors(async () => {
      await repo.eliminarLlista(llista.id)
      await carregarLlistes(null)
    })
  }

  async function marcarPreinscripcio(id: string) {
    await ambGestioErrors(async () => {
      await repo.marcarComPreinscripcio(id)
      await carregarLlistes()
    })
  }

  async function treure(itemId: string) {
    await ambGestioErrors(async () => {
      await repo.treureElement(itemId)
      if (actiuId) setElements(await repo.elementsDeLaLlista(actiuId))
    })
  }

  async function afegir(estudi: EstudiQualsevol) {
    if (!actiuId) return
    setAfegintId(estudi.id)
    try {
      await ambGestioErrors(async () => {
        await repo.afegirElement(actiuId, estudi.id, estudi.tipus)
        setElements(await repo.elementsDeLaLlista(actiuId))
        setCercaText('')
      })
    } finally {
      setAfegintId(null)
    }
  }

  function moure(origenIdx: number, destiIdx: number) {
    if (!actiuId || origenIdx === destiIdx || destiIdx < 0 || destiIdx >= elements.length) return
    const anteriors = elements
    const ordenats = [...elements]
    const [moute] = ordenats.splice(origenIdx, 1)
    ordenats.splice(destiIdx, 0, moute)
    setElements(ordenats)
    repo.reordenarLlista(actiuId, ordenats.map((el) => el.id)).catch(() => {
      setElements(anteriors)
      setErrorAccio("No s'ha pogut desar el nou ordre.")
    })
  }

  function onDrop(e: DragEvent, destiId: string) {
    e.preventDefault()
    if (!arrossegat || arrossegat === destiId) return
    moure(
      elements.findIndex((el) => el.id === arrossegat),
      elements.findIndex((el) => el.id === destiId),
    )
    setArrossegat(null)
  }

  const llistaActiva = llistes.find((l) => l.id === actiuId) ?? null

  return (
    <div className="fade-in grid gap-5 lg:grid-cols-[280px_1fr]">
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-ink">Les meves llistes</h1>
        <div className="space-y-2">
          {llistes.map((l) => (
            <button
              key={l.id}
              onClick={() => setActiuId(l.id)}
              className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${l.id === actiuId ? 'border-primary bg-info-bg text-primary' : 'border-line bg-surface text-ink hover:bg-canvas'}`}
            >
              <span>{l.nom}</span>
              {l.esPreinscripcio && <Badge tipus="accent">Preinscripció</Badge>}
            </button>
          ))}
        </div>
        <form onSubmit={crear} className="flex gap-2">
          <TextInput placeholder="Nova llista…" aria-label="Nom de la nova llista" value={nomNova} onChange={(e) => setNomNova(e.target.value)} maxLength={60} />
          <Button type="submit" mida="sm" disabled={!nomNova.trim()}>Crear</Button>
        </form>
        {errorAccio && <p role="alert" className="fade-in text-sm text-warning">{errorAccio}</p>}
      </div>

      <div>
        {!llistaActiva ? (
          <EstatBuit titol="Crea la teva primera llista" descripcio="Per exemple: «Opcions preinscripció» o «Plan B». Després hi pots afegir estudis des del cercador." />
        ) : (
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-ink">{llistaActiva.nom}</h2>
              <div className="flex gap-2">
                {!llistaActiva.esPreinscripcio && (
                  <Button variant="secondary" mida="sm" onClick={() => marcarPreinscripcio(llistaActiva.id)}>Marca com a preferències de preinscripció</Button>
                )}
                <Button variant="danger" mida="sm" onClick={() => eliminar(llistaActiva)}>Elimina la llista</Button>
              </div>
            </div>

            <div className="relative mb-4">
              <TextInput
                placeholder="Cerca un grau, cicle, batxillerat o estudi artístic per afegir-lo aquí…"
                aria-label="Cerca un estudi per afegir-lo a la llista"
                value={cercaText}
                onChange={(e) => setCercaText(e.target.value)}
                disabled={!!errorEstudis}
              />
              {errorEstudis && <p className="mt-1 text-xs text-warning">No s'ha pogut carregar el catàleg d'estudis per cercar-hi. Recarrega la pàgina.</p>}
              {resultatsCerca.length > 0 && (
                <ul className="fade-in absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-line bg-surface shadow-lg">
                  {resultatsCerca.map((e) => (
                    <li key={e.id}>
                      <button
                        onClick={() => afegir(e)}
                        disabled={afegintId === e.id}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-canvas disabled:opacity-50"
                      >
                        <span>
                          <span className="font-medium text-ink">{e.nom}</span>
                          <span className="block text-xs text-muted">{e.centre}</span>
                        </span>
                        <span className="shrink-0 text-xs text-primary">{afegintId === e.id ? 'Afegint…' : '+ Afegeix'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {elements.length === 0 ? (
              <p className="text-sm text-muted">Aquesta llista encara no té cap estudi. Cerca'l a sobre o afegeix-ne des del <Link to="/cercador" className="text-primary underline">cercador</Link>.</p>
            ) : (
              <ol className="space-y-2">
                {elements.map((el, i) => {
                  const estudi = estudis[el.estudiId]
                  return (
                    <li
                      key={el.id}
                      draggable
                      onDragStart={() => setArrossegat(el.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => onDrop(e, el.id)}
                      className="flex cursor-grab items-center gap-3 rounded-md border border-line bg-canvas px-3 py-2 transition-colors"
                    >
                      <span className="hidden text-sm font-semibold text-muted sm:inline" aria-hidden="true">⠿</span>
                      {llistaActiva.esPreinscripcio && <span className="text-sm font-semibold text-muted">{i + 1}a</span>}
                      {estudi ? (
                        <div className="min-w-0 flex-1">
                          <Link to={`/estudi/${estudi.id}`} className="text-sm font-medium text-ink hover:text-primary">{estudi.nom}</Link>
                          <p className="text-xs text-muted">{estudi.centre} · {formatPreu(estudi.preu)}</p>
                        </div>
                      ) : (
                        <p className="flex-1 text-sm text-muted">Estudi no disponible</p>
                      )}
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => moure(i, i - 1)}
                          disabled={i === 0}
                          aria-label={`Puja ${estudi?.nom ?? 'aquest estudi'}`}
                          className="rounded p-1 text-muted hover:bg-surface hover:text-ink disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moure(i, i + 1)}
                          disabled={i === elements.length - 1}
                          aria-label={`Baixa ${estudi?.nom ?? 'aquest estudi'}`}
                          className="rounded p-1 text-muted hover:bg-surface hover:text-ink disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button onClick={() => treure(el.id)} aria-label={`Treu ${estudi?.nom ?? 'aquest estudi'} de la llista`} className="rounded p-1 text-warning hover:bg-warning-bg">✕</button>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
