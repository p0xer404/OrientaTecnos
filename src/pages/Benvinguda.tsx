import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { repo } from '../lib/repo'
import { useAuth } from '../context/useAuth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Checkbox, RangeSlider } from '../components/ui/Forms'
import { IconChevronDown } from '../components/ui/Icons'
import { AREES_INTERES } from '../lib/riasec/mapping'
import type { ResultatPreferencies } from '../types/domain'

const MATERIES = [
  'Matemàtiques',
  'Llengua catalana',
  'Llengua castellana',
  'Anglès',
  'Biologia i Geologia',
  'Física i Química',
  'Tecnologia',
  'Economia',
  'Història',
  'Geografia',
  'Educació Física',
  'Música',
  'Arts Plàstiques',
  'Filosofia / Valors ètics',
]

type Lleu = 'universitat' | 'fp' | 'indecis'
type Titularitat = 'public' | 'privat' | 'igual'

/** Graella de matèries seleccionables; en marcar-ne una, la treu automàticament de
 * `exclouDe` (p. ex. no té sentit que una matèria sigui alhora "la que treus millor
 * nota" i "la que treus pitjor nota"). */
function GraellaMateries({
  seleccionades,
  onCanvia,
  exclouDe,
}: {
  seleccionades: string[]
  onCanvia: (noves: string[]) => void
  exclouDe?: [string[], (noves: string[]) => void]
}) {
  function alternar(materia: string) {
    if (seleccionades.includes(materia)) {
      onCanvia(seleccionades.filter((m) => m !== materia))
      return
    }
    onCanvia([...seleccionades, materia])
    if (exclouDe && exclouDe[0].includes(materia)) {
      exclouDe[1](exclouDe[0].filter((m) => m !== materia))
    }
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {MATERIES.map((materia) => (
        <Checkbox key={materia} label={materia} checked={seleccionades.includes(materia)} onChange={() => alternar(materia)} />
      ))}
    </div>
  )
}

const TOTAL_PASSOS = 7
const MINIM_SELECCIO = 2

export default function Benvinguda() {
  const { perfil, refrescar, marcarOnboardingFet } = useAuth()
  const navigate = useNavigate()
  const [pas, setPas] = useState(0)
  const [interessos, setInteressos] = useState<string[]>([])
  const [materiesBones, setMateriesBones] = useState<string[]>([])
  const [materiesFluixes, setMateriesFluixes] = useState<string[]>([])
  const [materiesPreferides, setMateriesPreferides] = useState<string[]>([])
  const [materiesMenysPreferides, setMateriesMenysPreferides] = useState<string[]>([])
  const [pressupost, setPressupost] = useState(2000)
  const [desplacament, setDesplacament] = useState(30)
  const [lleu, setLleu] = useState<Lleu>('indecis')
  const [titularitat, setTitularitat] = useState<Titularitat>('igual')
  const [desant, setDesant] = useState(false)
  const [errorDesar, setErrorDesar] = useState<string | null>(null)
  const desantRef = useRef(false)

  function alternarInteres(area: string) {
    setInteressos((actuals) => (actuals.includes(area) ? actuals.filter((a) => a !== area) : [...actuals, area]))
  }

  const esDarrer = pas === TOTAL_PASSOS - 1
  const percentatge = Math.round(((pas + 1) / TOTAL_PASSOS) * 100)

  const comptesPerPas: Partial<Record<number, number>> = {
    0: interessos.length,
    1: materiesBones.length,
    2: materiesFluixes.length,
    3: materiesPreferides.length,
    4: materiesMenysPreferides.length,
  }
  const compteActual = comptesPerPas[pas]
  const potContinuar = compteActual == null || compteActual >= MINIM_SELECCIO

  async function finalitzar() {
    if (!perfil || desantRef.current) return
    desantRef.current = true
    setDesant(true)
    setErrorDesar(null)
    try {
      await repo.actualitzarPerfil(perfil.id, { interessos })
      const resultat: ResultatPreferencies = {
        universitatVsFp: lleu === 'universitat' ? 80 : lleu === 'fp' ? 20 : 50,
        publicVsPrivat: titularitat === 'privat' ? 70 : titularitat === 'public' ? 30 : 50,
        importanciaNota: 50,
        importanciaIdioma: 50,
        pressupostMax: pressupost,
        disposatDesplacar: desplacament,
        materiesBones,
        materiesFluixes,
        materiesPreferides,
        materiesMenysPreferides,
      }
      await repo.desarResultatTest(perfil.id, 'preferencies', {}, resultat)
      await refrescar()
      marcarOnboardingFet()
      navigate('/cercador')
    } catch {
      setErrorDesar("No s'han pogut desar les respostes. Comprova la connexió i torna-ho a provar.")
    } finally {
      desantRef.current = false
      setDesant(false)
    }
  }

  function seguent() {
    if (esDarrer) finalitzar()
    else setPas((p) => p + 1)
  }

  function enrere() {
    setPas((p) => Math.max(0, p - 1))
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Benvingut/da, {perfil?.nom.split(' ')[0]}!</h1>
        <p className="text-sm text-muted">
          Abans de començar, respon aquest qüestionari ràpid perquè les recomanacions ja et quedin bé des del primer dia.
        </p>
      </div>

      <div className="sticky top-16 z-20 -mx-4 bg-canvas/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-md sm:border sm:border-line">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Pas {pas + 1} de {TOTAL_PASSOS}</span>
          <span>{percentatge}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out" style={{ width: `${percentatge}%` }} />
        </div>
      </div>

      <div key={pas} className="page-fade">
        <Card className="border-t-4 border-t-primary">
          {pas === 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Quins temes et generen més interès?</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {AREES_INTERES.map((area) => (
                  <Checkbox key={area} label={area} checked={interessos.includes(area)} onChange={() => alternarInteres(area)} />
                ))}
              </div>
            </div>
          )}

          {pas === 1 && (
            <div>
              <p className="mb-1 text-sm font-medium text-ink">Les teves notes</p>
              <p className="mb-3 text-xs text-muted">Marca les matèries on treus millor nota (pots deixar-ne sense marcar).</p>
              <GraellaMateries seleccionades={materiesBones} onCanvia={setMateriesBones} exclouDe={[materiesFluixes, setMateriesFluixes]} />
            </div>
          )}

          {pas === 2 && (
            <div>
              <p className="mb-1 text-sm font-medium text-ink">Les teves notes</p>
              <p className="mb-3 text-xs text-muted">I en quines treus pitjor nota?</p>
              <GraellaMateries seleccionades={materiesFluixes} onCanvia={setMateriesFluixes} exclouDe={[materiesBones, setMateriesBones]} />
            </div>
          )}

          {pas === 3 && (
            <div>
              <p className="mb-1 text-sm font-medium text-ink">Els teus gustos</p>
              <p className="mb-3 text-xs text-muted">Independentment de la nota: quines matèries t'agraden més?</p>
              <GraellaMateries seleccionades={materiesPreferides} onCanvia={setMateriesPreferides} exclouDe={[materiesMenysPreferides, setMateriesMenysPreferides]} />
            </div>
          )}

          {pas === 4 && (
            <div>
              <p className="mb-1 text-sm font-medium text-ink">Els teus gustos</p>
              <p className="mb-3 text-xs text-muted">I quines t'agraden menys?</p>
              <GraellaMateries seleccionades={materiesMenysPreferides} onCanvia={setMateriesMenysPreferides} exclouDe={[materiesPreferides, setMateriesPreferides]} />
            </div>
          )}

          {pas === 5 && (
            <div className="space-y-5">
              <div>
                <p className="mb-1 text-sm font-medium text-ink">Pressupost màxim anual per als estudis</p>
                <RangeSlider min={0} max={20000} step={500} value={pressupost} onChange={setPressupost} etiqueta={(v) => `${v.toLocaleString('ca-ES')} €/any`} ariaLabel="Pressupost màxim anual per als estudis" />
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-ink">Fins a quina distància de Terrassa estaries disposat/a a desplaçar-te?</p>
                <RangeSlider min={0} max={100} step={5} value={desplacament} onChange={setDesplacament} etiqueta={(v) => `${v} km`} ariaLabel="Distància màxima a desplaçar-te" />
              </div>
            </div>
          )}

          {pas === 6 && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium text-ink">Universitat o Formació Professional?</p>
                <div className="flex flex-wrap gap-2">
                  <Button mida="sm" variant={lleu === 'universitat' ? 'primary' : 'secondary'} onClick={() => setLleu('universitat')}>Universitat</Button>
                  <Button mida="sm" variant={lleu === 'fp' ? 'primary' : 'secondary'} onClick={() => setLleu('fp')}>FP</Button>
                  <Button mida="sm" variant={lleu === 'indecis' ? 'primary' : 'secondary'} onClick={() => setLleu('indecis')}>Encara no ho sé</Button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-ink">Centre públic o privat?</p>
                <div className="flex flex-wrap gap-2">
                  <Button mida="sm" variant={titularitat === 'public' ? 'primary' : 'secondary'} onClick={() => setTitularitat('public')}>Públic</Button>
                  <Button mida="sm" variant={titularitat === 'privat' ? 'primary' : 'secondary'} onClick={() => setTitularitat('privat')}>Privat</Button>
                  <Button mida="sm" variant={titularitat === 'igual' ? 'primary' : 'secondary'} onClick={() => setTitularitat('igual')}>M'és igual</Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: compteActual != null && compteActual < MINIM_SELECCIO ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <p
              className="mt-2 text-xs text-warning transition-opacity duration-200"
              style={{ opacity: compteActual != null && compteActual < MINIM_SELECCIO ? 1 : 0 }}
            >
              Selecciona'n almenys {MINIM_SELECCIO} per continuar ({compteActual ?? 0}/{MINIM_SELECCIO}).
            </p>
          </div>
        </div>

        {errorDesar && <p role="alert" className="fade-in mt-2 text-sm text-warning">{errorDesar}</p>}

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={enrere} disabled={pas === 0 || desant}>
            <IconChevronDown className="rotate-90" />
            Enrere
          </Button>
          <Button onClick={seguent} disabled={desant || !potContinuar}>
            {desant ? 'Desant…' : esDarrer ? 'Finalitza' : 'Següent'}
            {!esDarrer && !desant && <IconChevronDown className="-rotate-90" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
