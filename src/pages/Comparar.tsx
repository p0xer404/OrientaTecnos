import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTotsEstudis } from '../data/useTotsEstudis'
import { buidarComparador, obtenirComparador, treureDelComparador } from '../lib/comparador'
import { formatKm, formatNota, formatNumero, formatPreu } from '../lib/format'
import { tr } from '../lib/traduccio'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EstatBuit, EstatError } from '../components/ui/Misc'
import { SkeletonComparar } from '../components/ui/Skeleton'
import type { EstudiQualsevol } from '../types/estudi'

function anysEstimats(estudi: EstudiQualsevol): number {
  if (estudi.tipus === 'grau') {
    const match = estudi.raw.duracion?.match(/(\d+)/)
    return match ? Number(match[1]) : 4
  }
  if (estudi.tipus === 'fp') return estudi.raw.nivel.startsWith('Especialización') ? 1 : 2
  if (estudi.tipus === 'batxillerat') return 2
  return estudi.raw.tipo_estudios.some((t) => t.includes('Cicl')) ? 2 : 4
}

function millorIndex(valors: (number | null)[], sentit: 'min' | 'max'): number | null {
  const candidats = valors.map((v, i) => (v != null ? i : null)).filter((i): i is number => i != null)
  if (candidats.length < 2) return null
  let millor = candidats[0]
  for (const i of candidats) {
    if (sentit === 'min' ? valors[i]! < valors[millor]! : valors[i]! > valors[millor]!) millor = i
  }
  return millor
}

function Fila({ etiqueta, valors, format, millor }: { etiqueta: string; valors: (number | null)[]; format: (v: number) => string; millor: 'min' | 'max' }) {
  const idxMillor = millorIndex(valors, millor)
  return (
    <tr className="border-b border-line">
      <th scope="row" className="py-2 pr-4 text-left text-sm font-medium text-muted">{etiqueta}</th>
      {valors.map((v, i) => (
        <td key={i} className={`py-2 px-3 text-sm ${i === idxMillor ? 'bg-success-bg font-medium text-success' : 'text-ink'}`}>
          {v == null ? '—' : format(v)}
        </td>
      ))}
    </tr>
  )
}

export default function Comparar() {
  const { estudis: tots, error, retry } = useTotsEstudis()
  const [ids, setIds] = useState(obtenirComparador().map((r) => r.id))

  useEffect(() => {
    const handler = () => setIds(obtenirComparador().map((r) => r.id))
    window.addEventListener('comparador-canvi', handler)
    return () => window.removeEventListener('comparador-canvi', handler)
  }, [])

  // Ids que ja no existeixen al catàleg (dades actualitzades): es treuen perquè la barra
  // flotant no compti estudis que aquí no es poden mostrar.
  useEffect(() => {
    if (!tots) return
    const valids = new Set(tots.map((e) => e.id))
    ids.filter((id) => !valids.has(id)).forEach(treureDelComparador)
  }, [tots, ids])

  if (error) {
    return (
      <div className="fade-in space-y-4">
        <h1 className="text-2xl font-semibold text-ink">Comparador d'estudis</h1>
        <EstatError missatge={error} onReintentar={retry} />
      </div>
    )
  }

  if (ids.length === 0) {
    return (
      <EstatBuit
        titol="Encara no has afegit cap estudi al comparador"
        descripcio="Des del cercador o la fitxa de cada estudi, fes clic a «+ Afegir al comparador» (fins a 4 estudis)."
        accio={<Link to="/cercador"><Button>Anar al cercador</Button></Link>}
      />
    )
  }

  if (!tots) {
    return <div className="fade-in"><SkeletonComparar columnes={ids.length} /></div>
  }

  const estudis = ids.map((id) => tots.find((e) => e.id === id)).filter((e): e is EstudiQualsevol => Boolean(e))

  if (estudis.length === 0) {
    return (
      <EstatBuit
        titol="Encara no has afegit cap estudi al comparador"
        descripcio="Des del cercador o la fitxa de cada estudi, fes clic a «+ Afegir al comparador» (fins a 4 estudis)."
        accio={<Link to="/cercador"><Button>Anar al cercador</Button></Link>}
      />
    )
  }

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Comparador d'estudis</h1>
        <Button variant="secondary" mida="sm" onClick={() => { buidarComparador(); setIds([]) }}>Buida el comparador</Button>
      </div>
      <p className="text-sm text-muted">Es ressalta en verd el millor valor de cada fila (la nota de tall i la distància més baixes, el preu més baix, i les places i el cost total més favorables).</p>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className="py-2 pr-4 text-left text-sm text-muted"> </th>
              {estudis.map((e) => (
                <th key={e.id} className="entra-dalt px-3 py-2 text-left align-top">
                  <Link to={`/estudi/${e.id}`} className="text-sm font-semibold text-ink hover:text-primary">{e.nom}</Link>
                  <p className="text-xs text-muted">{e.centre}</p>
                  <button className="mt-1 text-xs text-warning underline" onClick={() => treureDelComparador(e.id)}>Treure</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Fila etiqueta="Nota de tall 2026" valors={estudis.map((e) => e.notaTall2026)} format={formatNota} millor="min" />
            <Fila etiqueta="Preu 1r curs" valors={estudis.map((e) => e.preu)} format={formatPreu} millor="min" />
            <Fila etiqueta="Cost total estimat (aprox.)" valors={estudis.map((e) => (e.preu != null ? e.preu * anysEstimats(e) : null))} format={formatPreu} millor="min" />
            <Fila etiqueta="Places" valors={estudis.map((e) => e.places)} format={formatNumero} millor="max" />
            <Fila etiqueta="Distància a Terrassa" valors={estudis.map((e) => e.kmTerrassa)} format={formatKm} millor="min" />
            <tr className="border-b border-line">
              <th scope="row" className="py-2 pr-4 text-left text-sm font-medium text-muted">Municipi</th>
              {estudis.map((e) => <td key={e.id} className="px-3 py-2 text-sm text-ink">{e.municipi}</td>)}
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className="py-2 pr-4 text-left text-sm font-medium text-muted">Tipus de centre</th>
              {estudis.map((e) => <td key={e.id} className="px-3 py-2 text-sm text-ink">{e.titularitat}</td>)}
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className="py-2 pr-4 text-left text-sm font-medium text-muted">Admissió</th>
              {estudis.map((e) => <td key={e.id} className="px-3 py-2 text-sm text-ink">{e.tipus === 'grau' || e.tipus === 'artistic' ? tr(e.raw.admision) : 'Sense nota de tall'}</td>)}
            </tr>
            <tr>
              <th scope="row" className="py-2 pr-4 text-left text-sm font-medium text-muted">Idiomes</th>
              {estudis.map((e) => <td key={e.id} className="px-3 py-2 text-sm text-ink">{e.tipus === 'grau' && e.raw.idiomas ? tr(e.raw.idiomas) : 'Consulta-ho al centre'}</td>)}
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  )
}
