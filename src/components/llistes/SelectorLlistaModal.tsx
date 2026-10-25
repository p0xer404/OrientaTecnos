import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Modal } from '../ui/Misc'
import { Button } from '../ui/Button'
import { TextInput } from '../ui/Forms'
import { repo } from '../../lib/repo'
import { useAuth } from '../../context/useAuth'
import type { Llista } from '../../types/domain'
import type { EstudiQualsevol } from '../../types/estudi'

interface Props {
  estudi: EstudiQualsevol | null
  onTancar: () => void
  onAfegit?: () => void
}

export function SelectorLlistaModal({ estudi, onTancar, onAfegit }: Props) {
  const { perfil } = useAuth()
  const [llistes, setLlistes] = useState<Llista[]>([])
  const [llistesAmbEstudi, setLlistesAmbEstudi] = useState<Set<string>>(new Set())
  const [nomNova, setNomNova] = useState('')
  const [carregant, setCarregant] = useState(false)
  const [confirmacio, setConfirmacio] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const temporitzador = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!perfil || !estudi) return
    let actiu = true
    window.clearTimeout(temporitzador.current)
    setConfirmacio(null)
    setError(null)
    repo
      .llistesDeLAlumne(perfil.id)
      .then(async (ls) => {
        const ambEstudi = new Set<string>()
        await Promise.all(
          ls.map(async (l) => {
            const els = await repo.elementsDeLaLlista(l.id)
            if (els.some((e) => e.estudiId === estudi.id)) ambEstudi.add(l.id)
          }),
        )
        if (!actiu) return
        setLlistes(ls)
        setLlistesAmbEstudi(ambEstudi)
      })
      .catch(() => {
        if (actiu) setError("No s'han pogut carregar les teves llistes.")
      })
    return () => {
      actiu = false
    }
  }, [perfil, estudi])

  useEffect(() => () => window.clearTimeout(temporitzador.current), [])

  if (!estudi || !perfil) return null

  function tancarAmbConfirmacio(nomLlista: string) {
    setConfirmacio(`Afegit a «${nomLlista}».`)
    onAfegit?.()
    temporitzador.current = window.setTimeout(() => {
      setConfirmacio(null)
      onTancar()
    }, 900)
  }

  async function afegir(llista: Llista) {
    setCarregant(true)
    setError(null)
    try {
      await repo.afegirElement(llista.id, estudi!.id, estudi!.tipus)
      tancarAmbConfirmacio(llista.nom)
    } catch {
      setError("No s'ha pogut afegir. Torna-ho a provar.")
    } finally {
      setCarregant(false)
    }
  }

  async function crearIAfegir(e: FormEvent) {
    e.preventDefault()
    const nom = nomNova.trim()
    if (!nom) return
    setCarregant(true)
    setError(null)
    try {
      const llista = await repo.crearLlista(perfil!.id, nom)
      await repo.afegirElement(llista.id, estudi!.id, estudi!.tipus)
      setNomNova('')
      tancarAmbConfirmacio(llista.nom)
    } catch {
      setError("No s'ha pogut crear la llista. Torna-ho a provar.")
    } finally {
      setCarregant(false)
    }
  }

  function tancar() {
    window.clearTimeout(temporitzador.current)
    onTancar()
  }

  return (
    <Modal obert={Boolean(estudi)} onTancar={tancar} titol={`Afegeix "${estudi.nom}" a una llista`}>
      {confirmacio ? (
        <p role="status" className="fade-in rounded-md bg-success-bg px-3 py-3 text-center text-sm font-medium text-success">✓ {confirmacio}</p>
      ) : (
        <div className="space-y-3">
          {llistes.length === 0 && <p className="text-sm text-muted">Encara no tens cap llista. Crea'n una a sota.</p>}
          <ul className="space-y-2">
            {llistes.map((l) => {
              const jaHiEs = llistesAmbEstudi.has(l.id)
              return (
                <li key={l.id}>
                  <Button variant="secondary" className="w-full justify-between" disabled={carregant || jaHiEs} onClick={() => afegir(l)}>
                    <span>
                      {l.nom} {l.esPreinscripcio && '· Preinscripció'}
                    </span>
                    {jaHiEs && <span className="text-xs text-muted">Ja hi és</span>}
                  </Button>
                </li>
              )
            })}
          </ul>
          <form onSubmit={crearIAfegir} className="flex gap-2 border-t border-line pt-3">
            <TextInput placeholder="Nom de la nova llista" aria-label="Nom de la nova llista" value={nomNova} onChange={(e) => setNomNova(e.target.value)} maxLength={60} />
            <Button type="submit" disabled={carregant || !nomNova.trim()}>
              Crear
            </Button>
          </form>
          {error && <p role="alert" className="text-sm text-warning">{error}</p>}
        </div>
      )}
    </Modal>
  )
}
