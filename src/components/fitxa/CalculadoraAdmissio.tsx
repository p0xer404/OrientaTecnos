import { useEffect, useMemo, useState } from 'react'
import { getPonderacions } from '../../data/loaders'
import { calcularNotaAcces, calcularNotaAdmissio, type MateriaEspecifica } from '../../lib/calculadoraAdmissio'
import { Label, Select, TextInput } from '../ui/Forms'
import { Badge } from '../ui/Badge'
import type { PonderacionsRaw } from '../../types/raw'

const fmt3 = new Intl.NumberFormat('ca-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
const NUM_MATERIES = 3

function parseNota(text: string): number | null {
  const n = Number(text.replace(',', '.'))
  if (text.trim() === '' || Number.isNaN(n)) return null
  return n
}

function Resultat({ etiqueta, valor, mida = 'sm' }: { etiqueta: string; valor: string; mida?: 'sm' | 'lg' }) {
  return (
    <div>
      <p className="text-xs text-muted">{etiqueta}</p>
      <p className={mida === 'lg' ? 'text-2xl font-semibold text-ink' : 'font-semibold text-ink'}>{valor}</p>
    </div>
  )
}

export function CalculadoraAdmissio({ grauId, notaTall }: { grauId: string; notaTall: number | null }) {
  const [dades, setDades] = useState<PonderacionsRaw | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    getPonderacions()
      .then(setDades)
      .catch(() => setError(true))
  }, [])

  const [nmb, setNmb] = useState('')
  const [faseGeneral, setFaseGeneral] = useState('')
  const [files, setFiles] = useState<{ materia: string; nota: string }[]>(
    Array.from({ length: NUM_MATERIES }, () => ({ materia: '', nota: '' })),
  )

  const entrada = dades?.por_grado[grauId]

  const materiesOrdenades = useMemo(() => {
    if (!entrada) return []
    return Object.entries(entrada.ponderaciones).sort(([a, pa], [b, pb]) => pb - pa || a.localeCompare(b, 'ca'))
  }, [entrada])

  const resultat = useMemo(() => {
    const nmbNum = parseNota(nmb)
    const fgNum = parseNota(faseGeneral)
    if (nmbNum == null || fgNum == null || !entrada) return null
    const notaAcces = calcularNotaAcces(nmbNum, fgNum)
    const materies: MateriaEspecifica[] = files
      .map((f) => ({ materia: f.materia, nota: parseNota(f.nota) ?? NaN }))
      .filter((m) => m.materia && !Number.isNaN(m.nota))
    const { notaAdmissio, comptades } = calcularNotaAdmissio(notaAcces, materies, entrada.ponderaciones)
    return { notaAcces, notaAdmissio, comptades }
  }, [nmb, faseGeneral, files, entrada])

  function actualitzaFila(i: number, canvi: Partial<{ materia: string; nota: string }>) {
    setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...canvi } : f)))
  }

  if (error) return null
  if (!dades) return <p className="text-sm text-muted">Carregant la calculadora…</p>

  if (!entrada) {
    return (
      <div className="rounded-lg bg-canvas p-3 text-sm text-muted">
        <p>No tenim la taula oficial de ponderacions d&apos;aquest grau aparellada correctament.</p>
        <a href={dades.fuente} target="_blank" rel="noreferrer" className="mt-1 inline-block text-primary underline">
          Consulta la taula oficial de ponderacions
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entrada.confianza === 'aproximada' && (
        <p className="text-xs text-muted">
          Ponderacions aparellades pel nom d&apos;aquest grau a la taula oficial; verifica-ho si tens dubtes.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="calc-nmb">Nota mitjana de Batxillerat</Label>
          <TextInput id="calc-nmb" inputMode="decimal" placeholder="ex. 7,50" value={nmb} onChange={(e) => setNmb(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="calc-fg">Fase general PAU</Label>
          <TextInput id="calc-fg" inputMode="decimal" placeholder="ex. 6,80" value={faseGeneral} onChange={(e) => setFaseGeneral(e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Matèries de la fase específica (compten les 2 que donin més punts)</Label>
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="grid grid-cols-[1fr_6rem] gap-2">
              <Select
                aria-label={`Matèria específica ${i + 1}`}
                value={f.materia}
                onChange={(e) => actualitzaFila(i, { materia: e.target.value })}
              >
                <option value="">— Sense presentar —</option>
                {materiesOrdenades.map(([materia, pes]) => (
                  <option key={materia} value={materia}>
                    {materia} (×{pes === 0.2 ? '0,2' : '0,1'})
                  </option>
                ))}
              </Select>
              <TextInput
                inputMode="decimal"
                placeholder="Nota"
                aria-label={`Nota de la matèria específica ${i + 1}`}
                value={f.nota}
                onChange={(e) => actualitzaFila(i, { nota: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      {resultat && (
        <div className="entra-dalt rounded-lg border border-line bg-canvas p-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Resultat etiqueta="Nota d'accés (sobre 10)" valor={fmt3.format(resultat.notaAcces)} />
            <Resultat etiqueta="Nota d'admissió a aquest grau (sobre 14)" valor={fmt3.format(resultat.notaAdmissio)} mida="lg" />
          </div>
          {resultat.comptades.length > 0 && (
            <p className="mt-2 text-xs text-muted">
              Matèries comptades: {resultat.comptades.map((m) => `${m.materia} (${m.nota} × ${m.pes === 0.2 ? '0,2' : '0,1'})`).join(', ')}.
            </p>
          )}
          {notaTall != null && (
            <p className="mt-2 text-sm">
              {notaTall <= 5 ? (
                <Badge tipus="info">L&apos;any passat hi van entrar totes les sol·licituds</Badge>
              ) : resultat.notaAdmissio >= notaTall ? (
                <Badge tipus="success">Superaries la nota de tall de l&apos;any passat ({fmt3.format(notaTall)})</Badge>
              ) : (
                <Badge tipus="warning">
                  Et faltarien {fmt3.format(notaTall - resultat.notaAdmissio)} punts per a la nota de tall de l&apos;any passat ({fmt3.format(notaTall)})
                </Badge>
              )}
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-muted">
        Càlcul orientatiu amb la fórmula oficial de la preinscripció universitària (0,6 × Batxillerat + 0,4 × fase general + fins a 2
        matèries específiques ponderades). La nota de tall de referència és la de l&apos;última assignació publicada, que pot variar
        d&apos;un any a l&apos;altre.{' '}
        <a href={dades.fuente} target="_blank" rel="noreferrer" className="text-primary underline">
          Font oficial de les ponderacions
        </a>
        .
      </p>
    </div>
  )
}
